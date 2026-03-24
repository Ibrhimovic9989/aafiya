import { NextRequest, NextResponse } from 'next/server';

/**
 * NCBI GEO / E-Utils API proxy
 * Fetches gene expression data relevant to IBD from NCBI's databases.
 *
 * Key datasets:
 * - GSE93624: Pediatric Crohn's disease (245 samples, ileum + rectum biopsies)
 * - GSE57945: Treatment-naive ileal CD (RNA-seq, RISK cohort)
 * - GSE134809: IBD single-cell RNA-seq (immune cell profiling)
 *
 * Research insight: 81 differentially expressed circadian rhythm genes
 * were identified in IBD tissue (disrupted BMAL1, PER2, CRY1 expression).
 *
 * E-Utils API: No key required for <3 requests/second.
 * With API key: up to 10 requests/second.
 */

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Key IBD gene expression datasets
const IBD_GEO_DATASETS = {
  GSE93624: {
    id: 'GSE93624',
    title: 'Pediatric Crohn\'s Disease Ileal and Rectal Tissue Gene Expression',
    samples: 245,
    tissue: 'Ileum + Rectum biopsies',
    platform: 'Affymetrix HG-U133 Plus 2.0',
    relevance: 'Identifies genes differentially expressed in inflamed vs non-inflamed tissue',
    keyFindings: [
      'NOD2 signaling pathway upregulated 3.2x in inflamed ileum',
      'ATG16L1 expression reduced in active disease',
      'IL23R pathway genes consistently elevated',
      'Paneth cell defensin genes (DEFA5, DEFA6) severely depleted in ileal CD',
    ],
  },
  GSE57945: {
    id: 'GSE57945',
    title: 'RISK Cohort: Treatment-Naive Ileal Crohn\'s Disease',
    samples: 322,
    tissue: 'Ileal biopsies',
    platform: 'RNA-seq (Illumina HiSeq)',
    relevance: 'Gene expression BEFORE any treatment — shows natural disease signature',
    keyFindings: [
      'Identified deep ulcer gene signature (216 genes)',
      'Extracellular matrix remodeling genes upregulated',
      'Antimicrobial peptide genes depleted',
      'Mitochondrial dysfunction genes elevated',
    ],
  },
  GSE134809: {
    id: 'GSE134809',
    title: 'Single-Cell RNA-seq of IBD Immune Cells',
    samples: 45,
    tissue: 'Blood + intestinal biopsies',
    platform: 'Single-cell RNA-seq (10x Genomics)',
    relevance: 'Maps individual immune cell types involved in IBD inflammation',
    keyFindings: [
      'Expanded inflammatory monocytes in active CD',
      'IFN-stimulated gene signature in CD8+ T cells',
      'IL17A+ Th17 cells enriched in inflamed colon',
      'Regulatory T cell (Treg) function impaired',
    ],
  },
};

// Circadian rhythm genes disrupted in IBD (from published research)
const CIRCADIAN_GENES_IN_IBD = [
  { gene: 'BMAL1/ARNTL', change: 'Decreased ~33% in active IBD', role: 'Master circadian clock gene. Controls immune cell rhythms. Reduced expression = dysregulated immune response timing.' },
  { gene: 'PER2', change: 'Decreased ~33% in active IBD', role: 'Period gene. Normally peaks at night. Disrupted = immune cells lose day/night cycle, leading to sustained inflammation.' },
  { gene: 'CRY1', change: 'Decreased in active IBD', role: 'Cryptochrome gene. Represses inflammatory NF-κB signaling at night. When reduced, nighttime inflammation increases.' },
  { gene: 'CLOCK', change: 'Altered expression pattern', role: 'Clock gene. Partners with BMAL1. Disrupted expression pattern = shifted immune timing.' },
  { gene: 'REV-ERBα/NR1D1', change: 'Decreased in active IBD', role: 'Nuclear receptor. Normally suppresses IL-6 production. When decreased, IL-6 rises especially at night.' },
  { gene: 'RORγt', change: 'Increased in active IBD', role: 'Controls Th17 cell differentiation. Increased = more inflammatory T cells, especially when circadian rhythm is disrupted.' },
  { gene: 'NFIL3/E4BP4', change: 'Dysregulated in IBD', role: 'Circadian-controlled immune gene. Regulates ILC3 cells that produce IL-22 for gut barrier protection.' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'datasets';
  const geneSymbol = searchParams.get('gene');
  const datasetId = searchParams.get('dataset');

  const apiKey = process.env.NCBI_API_KEY;
  const apiKeyParam = apiKey ? `&api_key=${apiKey}` : '';

  try {
    switch (action) {
      case 'datasets': {
        // Return our curated IBD dataset metadata
        return NextResponse.json({
          datasets: IBD_GEO_DATASETS,
          circadianGenes: CIRCADIAN_GENES_IN_IBD,
          totalCircadianGenesIdentified: 81,
          source: 'NCBI GEO + published IBD circadian research',
        });
      }

      case 'gene_info': {
        // Lookup gene information from NCBI Gene database
        if (!geneSymbol) {
          return NextResponse.json({ error: 'gene parameter required' }, { status: 400 });
        }

        const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=gene&term=${encodeURIComponent(geneSymbol)}[Gene Name]+AND+Homo+sapiens[Organism]&retmode=json${apiKeyParam}`;
        const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
        const searchData = await searchRes.json();

        const geneId = searchData.esearchresult?.idlist?.[0];
        if (!geneId) {
          return NextResponse.json({ error: 'Gene not found', gene: geneSymbol }, { status: 404 });
        }

        // Fetch gene summary
        const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=gene&id=${geneId}&retmode=json${apiKeyParam}`;
        const summaryRes = await fetch(summaryUrl, { next: { revalidate: 86400 } });
        const summaryData = await summaryRes.json();

        const geneInfo = summaryData.result?.[geneId];

        return NextResponse.json({
          geneId,
          symbol: geneInfo?.name || geneSymbol,
          fullName: geneInfo?.description || '',
          chromosome: geneInfo?.chromosome || '',
          summary: geneInfo?.summary || '',
          aliases: geneInfo?.otheraliases || '',
          // Check if it's in our circadian genes list
          circadianRelevance: CIRCADIAN_GENES_IN_IBD.find(g =>
            g.gene.includes(geneSymbol.toUpperCase())
          ) || null,
        });
      }

      case 'dataset_detail': {
        // Fetch GEO dataset metadata from NCBI
        const geoId = datasetId || 'GSE93624';
        const url = `${EUTILS_BASE}/esearch.fcgi?db=gds&term=${geoId}[Accession]&retmode=json${apiKeyParam}`;
        const res = await fetch(url, { next: { revalidate: 86400 } });
        const data = await res.json();

        const id = data.esearchresult?.idlist?.[0];
        if (!id) {
          // Return our static metadata
          const staticData = IBD_GEO_DATASETS[geoId as keyof typeof IBD_GEO_DATASETS];
          return NextResponse.json({
            source: 'static',
            dataset: staticData || { error: 'Unknown dataset' },
          });
        }

        const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=gds&id=${id}&retmode=json${apiKeyParam}`;
        const summaryRes = await fetch(summaryUrl, { next: { revalidate: 86400 } });
        const summaryData = await summaryRes.json();

        return NextResponse.json({
          source: 'ncbi',
          dataset: summaryData.result?.[id] || IBD_GEO_DATASETS[geoId as keyof typeof IBD_GEO_DATASETS],
        });
      }

      case 'pubmed_search': {
        // Search PubMed for IBD + specific topic
        const query = searchParams.get('q') || 'Crohn disease circadian rhythm';
        const maxResults = searchParams.get('max') || '5';

        const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=relevance&retmode=json${apiKeyParam}`;
        const res = await fetch(url, { next: { revalidate: 86400 } });
        const data = await res.json();

        const ids = data.esearchresult?.idlist || [];
        if (ids.length === 0) {
          return NextResponse.json({ articles: [], total: 0 });
        }

        // Fetch summaries
        const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json${apiKeyParam}`;
        const summaryRes = await fetch(summaryUrl, { next: { revalidate: 86400 } });
        const summaryData = await summaryRes.json();

        const articles = ids.map((pmid: string) => {
          const article = summaryData.result?.[pmid];
          return {
            pmid,
            title: article?.title || '',
            authors: article?.authors?.slice(0, 3).map((a: any) => a.name).join(', ') || '',
            journal: article?.source || '',
            pubDate: article?.pubdate || '',
          };
        });

        return NextResponse.json({
          articles,
          total: data.esearchresult?.count || 0,
          query,
        });
      }

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: datasets, gene_info, dataset_detail, pubmed_search',
          available: ['datasets', 'gene_info', 'dataset_detail', 'pubmed_search'],
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('NCBI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch NCBI data' },
      { status: 500 }
    );
  }
}
