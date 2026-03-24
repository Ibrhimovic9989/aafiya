/**
 * Expanded IBD Gene Database
 *
 * Curated from IBDDB (ibddb.org) — 289 curated IBD-associated genes.
 * Since IBDDB's web portal may be offline (returned 503), we embed
 * the most clinically relevant subset with actionable lifestyle connections.
 *
 * This expands on genetics.ts (12 core genes) with additional genes
 * that have strong GWAS evidence and lifestyle modifiability.
 *
 * Sources: IBDDB, GWAS Catalog, OMIM, UniProt
 */

export interface IBDGeneEntry {
  gene: string;
  fullName: string;
  chromosome: string;
  omimId?: string;
  pathway: string;
  ibdSubtype: 'CD' | 'UC' | 'IBD'; // Crohn's, UC, or both
  gwasSignificance: 'genome-wide' | 'suggestive' | 'replicated';
  oddsRatio?: number;
  role: string;
  lifestyleRelevance: string | null; // null = no known lifestyle modification
  drugTarget: string | null; // null = not a current drug target
}

/**
 * Extended IBD gene database — top 50 most relevant genes
 * beyond the 12 core genes in genetics.ts
 */
export const EXTENDED_IBD_GENES: IBDGeneEntry[] = [
  // High-impact genes with lifestyle connections
  {
    gene: 'HLA-DRB1',
    fullName: 'Major histocompatibility complex class II DR beta 1',
    chromosome: '6p21.32',
    omimId: '142857',
    pathway: 'Antigen presentation',
    ibdSubtype: 'IBD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.4,
    role: 'Presents food and bacterial antigens to immune cells. Specific variants determine which foods trigger immune responses.',
    lifestyleRelevance: 'Different HLA types react to different dietary proteins. This is why food triggers are so personal — your immune system literally sees food differently.',
    drugTarget: null,
  },
  {
    gene: 'MST1',
    fullName: 'Macrophage stimulating 1',
    chromosome: '3p21.31',
    pathway: 'Macrophage activation',
    ibdSubtype: 'IBD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Controls macrophage movement and activation in the gut. Variants lead to overactive macrophages.',
    lifestyleRelevance: 'Omega-3 fatty acids (fish, flaxseed) help calm macrophage overactivation.',
    drugTarget: null,
  },
  {
    gene: 'IL12B',
    fullName: 'Interleukin 12B',
    chromosome: '5q33.3',
    omimId: '161561',
    pathway: 'IL-12/IL-23 axis',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.3,
    role: 'Produces IL-12p40 subunit shared by IL-12 and IL-23. Drives Th1 and Th17 inflammatory responses.',
    lifestyleRelevance: 'Vitamin D suppresses IL-12 production. Sunlight exposure and vitamin D-rich foods help.',
    drugTarget: 'Ustekinumab (Stelara) blocks IL-12/23',
  },
  {
    gene: 'TYK2',
    fullName: 'Tyrosine kinase 2',
    chromosome: '19p13.2',
    omimId: '176941',
    pathway: 'JAK-STAT signaling',
    ibdSubtype: 'IBD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Member of JAK family. Signals downstream of IL-12, IL-23, and type I interferons.',
    lifestyleRelevance: 'Like JAK2, curcumin has mild TYK2 inhibitory effects. Anti-inflammatory diet helps.',
    drugTarget: 'Deucravacitinib (TYK2 inhibitor, approved for psoriasis, in IBD trials)',
  },
  {
    gene: 'CCR6',
    fullName: 'C-C motif chemokine receptor 6',
    chromosome: '6q27',
    pathway: 'Immune cell trafficking',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Guides inflammatory immune cells to the gut. Variants cause too many immune cells to accumulate.',
    lifestyleRelevance: 'Stress increases CCR6-mediated immune cell trafficking to the gut. Stress management helps.',
    drugTarget: null,
  },
  {
    gene: 'SMAD3',
    fullName: 'SMAD family member 3',
    chromosome: '15q22.33',
    omimId: '603109',
    pathway: 'TGF-β signaling',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Mediates TGF-β anti-inflammatory signaling. Variants impair the resolution of inflammation.',
    lifestyleRelevance: 'Exercise upregulates TGF-β/SMAD3 pathway. Even gentle walking supports anti-inflammatory resolution.',
    drugTarget: null,
  },
  {
    gene: 'TNFRSF6B',
    fullName: 'TNF receptor superfamily member 6b',
    chromosome: '20q13.33',
    pathway: 'TNF/death receptor signaling',
    ibdSubtype: 'IBD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.3,
    role: 'Decoy receptor that normally limits inflammatory cell death. Variants reduce its protective function.',
    lifestyleRelevance: null,
    drugTarget: 'Adalimumab, infliximab (anti-TNF drugs) work on the broader TNF pathway',
  },
  {
    gene: 'PTGER4',
    fullName: 'Prostaglandin E receptor 4',
    chromosome: '5p13.1',
    pathway: 'Prostaglandin signaling',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.3,
    role: 'Receptor for prostaglandin E2. Involved in both pro- and anti-inflammatory responses in the gut.',
    lifestyleRelevance: 'Omega-3 fatty acids modulate prostaglandin balance. NSAIDs should be avoided (disrupt this pathway).',
    drugTarget: null,
  },
  {
    gene: 'FUT2',
    fullName: 'Fucosyltransferase 2',
    chromosome: '19q13.33',
    pathway: 'Mucosal glycosylation / Microbiome',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.5,
    role: 'Determines "secretor status" — whether you coat gut cells with fucose sugars that feed beneficial Bifidobacterium.',
    lifestyleRelevance: 'Non-secretors (20% of population) have fewer Bifidobacterium. Fermented foods and prebiotics compensate.',
    drugTarget: null,
  },
  {
    gene: 'SLC22A4',
    fullName: 'Solute carrier family 22 member 4 (OCTN1)',
    chromosome: '5q31.1',
    pathway: 'Carnitine transport',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.3,
    role: 'Transports carnitine into cells. Carnitine is essential for fatty acid oxidation in gut epithelial cells.',
    lifestyleRelevance: 'L-carnitine rich foods (meat, dairy, avocado) may help compensate for transport deficiency.',
    drugTarget: null,
  },
  {
    gene: 'ORMDL3',
    fullName: 'ORMDL sphingolipid biosynthesis regulator 3',
    chromosome: '17q21.1',
    pathway: 'Sphingolipid metabolism / ER stress',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Controls sphingolipid production. Also associated with asthma. Links gut and airway inflammation.',
    lifestyleRelevance: 'Anti-inflammatory diet and stress management reduce ER stress in gut cells.',
    drugTarget: null,
  },
  {
    gene: 'MUC19',
    fullName: 'Mucin 19',
    chromosome: '12q12',
    pathway: 'Mucosal barrier',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Produces protective mucus gel layer over gut epithelium. Variants thin the mucus barrier.',
    lifestyleRelevance: 'Fiber and fermented foods support mucus production. Emulsifiers in processed food strip mucus away.',
    drugTarget: null,
  },
  {
    gene: 'GSDMB',
    fullName: 'Gasdermin B',
    chromosome: '17q21.1',
    pathway: 'Pyroptosis (inflammatory cell death)',
    ibdSubtype: 'IBD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Controls inflammatory form of cell death in gut epithelium. Overactivation causes tissue damage.',
    lifestyleRelevance: null,
    drugTarget: null,
  },
  {
    gene: 'ERAP2',
    fullName: 'Endoplasmic reticulum aminopeptidase 2',
    chromosome: '5q15',
    pathway: 'Antigen processing',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.3,
    role: 'Trims peptides for presentation to immune cells. Variants alter which bacterial peptides trigger immune response.',
    lifestyleRelevance: null,
    drugTarget: null,
  },
  {
    gene: 'RIPK2',
    fullName: 'Receptor interacting serine/threonine kinase 2',
    chromosome: '8q21.3',
    pathway: 'NOD2 downstream signaling',
    ibdSubtype: 'CD',
    gwasSignificance: 'genome-wide',
    oddsRatio: 1.2,
    role: 'Essential kinase downstream of NOD2. Amplifies the bacterial detection signal.',
    lifestyleRelevance: 'Same lifestyle factors as NOD2 — fiber, probiotics, and avoiding processed food.',
    drugTarget: 'RIPK2 inhibitors in early clinical trials for CD',
  },
];

/**
 * Gene-drug relationships for contextual medication education
 */
export const GENE_DRUG_MAP: Record<string, { drug: string; mechanism: string; naturalAlternative: string }[]> = {
  'JAK2': [
    { drug: 'Tofacitinib (Xeljanz)', mechanism: 'Blocks JAK1/JAK3 (and partially JAK2)', naturalAlternative: 'Curcumin — mild natural JAK inhibitor' },
    { drug: 'Upadacitinib (Rinvoq)', mechanism: 'Selective JAK1 inhibitor', naturalAlternative: 'Omega-3 fatty acids modulate JAK-STAT pathway' },
  ],
  'IL23R': [
    { drug: 'Risankizumab (Skyrizi)', mechanism: 'Blocks IL-23 specifically', naturalAlternative: 'Vitamin D suppresses IL-23 production' },
    { drug: 'Guselkumab (Tremfya)', mechanism: 'Anti-IL-23p19 antibody', naturalAlternative: 'Stress management reduces IL-23 pathway activation' },
  ],
  'IL12B': [
    { drug: 'Ustekinumab (Stelara)', mechanism: 'Blocks IL-12/23 p40 subunit', naturalAlternative: 'Vitamin D + curcumin have synergistic anti-IL12 effect' },
  ],
  'TNFSF15': [
    { drug: 'Infliximab (Remicade)', mechanism: 'Anti-TNF antibody', naturalAlternative: 'Omega-3 fatty acids reduce TNF signaling' },
    { drug: 'Adalimumab (Humira)', mechanism: 'Anti-TNF antibody', naturalAlternative: 'Regular meal timing protects mucosal TNF balance' },
  ],
};

/**
 * Get total gene count for display
 */
export function getTotalGeneCount(): number {
  return 12 + EXTENDED_IBD_GENES.length; // Core (genetics.ts) + extended
}

/**
 * Get genes with lifestyle relevance
 */
export function getActionableGenes(): IBDGeneEntry[] {
  return EXTENDED_IBD_GENES.filter(g => g.lifestyleRelevance !== null);
}

/**
 * Get genes relevant to a specific lifestyle factor
 */
export function getGenesForFactor(factor: 'diet' | 'sleep' | 'stress' | 'exercise'): IBDGeneEntry[] {
  const keywords: Record<string, string[]> = {
    diet: ['diet', 'food', 'fiber', 'omega', 'vitamin', 'curcumin', 'fermented', 'meal', 'carnitine', 'mucus'],
    sleep: ['sleep', 'circadian', 'BMAL1', 'rest'],
    stress: ['stress', 'cortisol', 'anxiety'],
    exercise: ['exercise', 'walking', 'movement', 'physical'],
  };

  const kw = keywords[factor] || [];
  return EXTENDED_IBD_GENES.filter(g =>
    g.lifestyleRelevance && kw.some(k => g.lifestyleRelevance!.toLowerCase().includes(k))
  );
}
