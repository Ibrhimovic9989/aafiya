import { NextRequest, NextResponse } from 'next/server';

/**
 * GWAS Catalog API proxy
 * Fetches genetic associations for IBD-related traits from EBI's GWAS Catalog.
 * No API key required — completely free and open access.
 *
 * EFO Trait IDs:
 * - Crohn's disease → EFO_0000384
 * - Ulcerative colitis → EFO_0000685
 * - Inflammatory bowel disease → EFO_0003767
 */

const GWAS_BASE = 'https://www.ebi.ac.uk/gwas/rest/api';

const EFO_TRAITS: Record<string, string> = {
  ibd: 'EFO_0003767',
  crohns: 'EFO_0000384',
  uc: 'EFO_0000685',
};

// Key genes known to be relevant to IBD — for focused lookups
const IBD_KEY_GENES = [
  'NOD2', 'ATG16L1', 'IL23R', 'IRGM', 'IL10', 'CARD9',
  'STAT3', 'JAK2', 'TNFSF15', 'HLA-DRB1', 'MST1', 'LRRK2',
  'PTPN2', 'NKX2-3', 'SMAD3', 'CCR6', 'IL12B', 'TYK2',
];

interface GWASAssociation {
  rsId: string;
  pValue: number;
  orPerCopyNum: number | null;
  genes: string[];
  traitName: string;
  riskAllele: string;
  pubmedId: string;
  studyTitle: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trait = searchParams.get('trait') || 'crohns';
  const gene = searchParams.get('gene');
  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '20');

  try {
    let url: string;

    if (gene) {
      // Lookup associations for a specific gene
      url = `${GWAS_BASE}/singleNucleotidePolymorphisms?geneName=${encodeURIComponent(gene)}&page=${page}&size=${size}`;
    } else {
      // Lookup all associations for a trait
      const efoId = EFO_TRAITS[trait] || EFO_TRAITS.crohns;
      url = `${GWAS_BASE}/efoTraits/${efoId}/associations?page=${page}&size=${size}`;
    }

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error(`GWAS API returned ${res.status}`);
    }

    const data = await res.json();

    // Parse associations from the GWAS response
    const associations: GWASAssociation[] = [];

    // Handle trait-based response (embedded associations)
    const items = data._embedded?.associations || data._embedded?.singleNucleotidePolymorphisms || [];

    for (const item of items) {
      try {
        if (item.loci) {
          // Association response format
          const rsIds: string[] = [];
          const genes: string[] = [];
          let riskAllele = '';

          for (const locus of item.loci || []) {
            for (const sra of locus.strongestRiskAlleles || []) {
              riskAllele = sra.riskAlleleName || '';
              const rsMatch = riskAllele.match(/rs\d+/);
              if (rsMatch) rsIds.push(rsMatch[0]);
            }
            for (const ag of locus.authorReportedGenes || []) {
              if (ag.geneName) genes.push(ag.geneName);
            }
          }

          const pMantissa = item.pvalueMantissa || 0;
          const pExponent = item.pvalueExponent || 0;
          const pValue = pMantissa * Math.pow(10, pExponent);

          if (rsIds.length > 0) {
            associations.push({
              rsId: rsIds[0],
              pValue,
              orPerCopyNum: item.orPerCopyNum || null,
              genes: genes.length > 0 ? genes : ['Unknown'],
              traitName: item.efoTraits?.[0]?.trait || trait,
              riskAllele,
              pubmedId: '',
              studyTitle: '',
            });
          }
        } else if (item.rsId) {
          // SNP response format
          associations.push({
            rsId: item.rsId,
            pValue: 0,
            orPerCopyNum: null,
            genes: item.genomicContexts?.map((gc: any) => gc.gene?.geneName).filter(Boolean) || [],
            traitName: trait,
            riskAllele: '',
            pubmedId: '',
            studyTitle: '',
          });
        }
      } catch {
        // Skip malformed entries
      }
    }

    // Sort by p-value (most significant first)
    associations.sort((a, b) => a.pValue - b.pValue);

    // Page info
    const pageInfo = data.page || {};

    return NextResponse.json({
      associations,
      keyGenes: IBD_KEY_GENES,
      trait,
      page: {
        number: pageInfo.number || page,
        size: pageInfo.size || size,
        totalElements: pageInfo.totalElements || associations.length,
        totalPages: pageInfo.totalPages || 1,
      },
    });
  } catch (error: any) {
    console.error('GWAS API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch genetic data' },
      { status: 500 }
    );
  }
}
