/**
 * Genetics context for Aafiya
 *
 * Maps key IBD-associated genes to their functional roles,
 * and connects them to lifestyle factors Aafiya can actually act on.
 * This bridges the gap between GWAS data and actionable health insights.
 */

export interface GeneInfo {
  gene: string;
  fullName: string;
  pathway: string;
  role: string;
  lifestyleConnection: string;
  aafiyaInsight: string;
  category: 'immune' | 'autophagy' | 'barrier' | 'microbiome' | 'signaling';
  riskLevel: 'high' | 'moderate' | 'emerging';
}

/**
 * Key IBD-associated genes with clinical context.
 * These are the most well-characterized from GWAS studies.
 */
export const IBD_GENE_DATABASE: GeneInfo[] = [
  {
    gene: 'NOD2',
    fullName: 'Nucleotide-binding oligomerization domain 2',
    pathway: 'Innate immunity',
    role: 'Detects bacterial components in the gut wall. Mutations impair the gut\'s ability to fight bacteria, leading to chronic inflammation.',
    lifestyleConnection: 'Gut bacteria balance is critical. Diet rich in fiber feeds good bacteria that compensate for NOD2 weakness. Processed food starves them.',
    aafiyaInsight: 'Your gut barrier works extra hard — foods that support good bacteria (like dal, curd, fiber-rich foods) help it stay strong.',
    category: 'immune',
    riskLevel: 'high',
  },
  {
    gene: 'ATG16L1',
    fullName: 'Autophagy related 16 like 1',
    pathway: 'Autophagy (cellular cleanup)',
    role: 'Helps cells clean up damaged parts and invading bacteria. When impaired, cellular waste builds up and triggers inflammation.',
    lifestyleConnection: 'Sleep and fasting both activate autophagy. Disrupted sleep = less cleanup. Time-restricted eating helps.',
    aafiyaInsight: 'Sleep is actually your body\'s cleanup time — when you sleep well, your cells get a chance to heal and reset.',
    category: 'autophagy',
    riskLevel: 'high',
  },
  {
    gene: 'IL23R',
    fullName: 'Interleukin 23 receptor',
    pathway: 'Th17 immune response',
    role: 'Controls inflammatory T-cell responses in the gut. Variants can make the immune system overreact.',
    lifestyleConnection: 'Stress activates the IL-23/Th17 pathway. Stress management, good sleep, and anti-inflammatory foods help dampen it.',
    aafiyaInsight: 'When you\'re stressed, your immune system gets louder than it needs to be. Rest and calming activities actually help at a cellular level.',
    category: 'immune',
    riskLevel: 'high',
  },
  {
    gene: 'IRGM',
    fullName: 'Immunity related GTPase M',
    pathway: 'Autophagy / bacterial defense',
    role: 'Helps destroy bacteria that sneak into gut cells. Variants reduce this defense.',
    lifestyleConnection: 'Probiotics and fermented foods support the bacterial defense that IRGM handles. Antibiotics disrupt it.',
    aafiyaInsight: 'Fermented foods like dahi and buttermilk support your gut\'s defense system — they\'re like backup for your cells.',
    category: 'autophagy',
    riskLevel: 'moderate',
  },
  {
    gene: 'IL10',
    fullName: 'Interleukin 10',
    pathway: 'Anti-inflammatory signaling',
    role: 'IL-10 is the body\'s main "calm down" signal for inflammation. When it\'s weak, inflammation runs unchecked.',
    lifestyleConnection: 'Exercise, adequate sleep, and omega-3 fatty acids boost IL-10 production naturally.',
    aafiyaInsight: 'Your body has natural ways to calm inflammation — good sleep and gentle movement help produce more of the calming signals.',
    category: 'signaling',
    riskLevel: 'high',
  },
  {
    gene: 'CARD9',
    fullName: 'Caspase recruitment domain family member 9',
    pathway: 'Fungal defense / microbiome',
    role: 'Helps the immune system fight fungal infections in the gut. Variants alter the gut fungal community.',
    lifestyleConnection: 'Refined sugar feeds gut fungi (Candida). Reducing sugar intake helps maintain fungal balance.',
    aafiyaInsight: 'Sugar feeds the wrong kind of gut residents — cutting back on sweets and processed foods helps keep things balanced.',
    category: 'microbiome',
    riskLevel: 'moderate',
  },
  {
    gene: 'STAT3',
    fullName: 'Signal transducer and activator of transcription 3',
    pathway: 'Immune signaling / wound healing',
    role: 'Critical for gut wound healing and immune regulation. Variants impair the gut\'s ability to repair itself.',
    lifestyleConnection: 'Zinc and vitamin A support STAT3-mediated wound healing. Found in eggs, pumpkin seeds, and leafy greens.',
    aafiyaInsight: 'Your gut is always repairing itself — nutrients like zinc (in pumpkin seeds, eggs) help it heal faster.',
    category: 'signaling',
    riskLevel: 'moderate',
  },
  {
    gene: 'JAK2',
    fullName: 'Janus kinase 2',
    pathway: 'JAK-STAT inflammatory signaling',
    role: 'Part of the signaling cascade that drives gut inflammation. Target of JAK inhibitor drugs (tofacitinib).',
    lifestyleConnection: 'Curcumin (in turmeric/haldi) is a natural JAK inhibitor. Butyrate (from fiber fermentation) also modulates this pathway.',
    aafiyaInsight: 'Haldi (turmeric) isn\'t just a kitchen staple — it actually works on the same pathway as some medications, just more gently.',
    category: 'signaling',
    riskLevel: 'moderate',
  },
  {
    gene: 'TNFSF15',
    fullName: 'TNF superfamily member 15',
    pathway: 'Mucosal immunity',
    role: 'Activates immune cells specifically in the gut lining. Variants cause overactivation.',
    lifestyleConnection: 'Omega-3 fatty acids (fish, flaxseed) reduce TNF signaling. Regular meals prevent gut mucosal stress.',
    aafiyaInsight: 'Regular meals protect your gut lining — skipping meals stresses the very cells that keep you safe.',
    category: 'immune',
    riskLevel: 'moderate',
  },
  {
    gene: 'LRRK2',
    fullName: 'Leucine rich repeat kinase 2',
    pathway: 'Autophagy / innate immunity',
    role: 'Also linked to Parkinson\'s. In IBD, it affects how immune cells respond to gut bacteria.',
    lifestyleConnection: 'Regular exercise and sleep support the autophagy pathway that LRRK2 regulates.',
    aafiyaInsight: 'Gentle exercise (even walking) helps your cells stay clean and healthy on the inside.',
    category: 'autophagy',
    riskLevel: 'emerging',
  },
  {
    gene: 'PTPN2',
    fullName: 'Protein tyrosine phosphatase non-receptor type 2',
    pathway: 'Gut barrier integrity',
    role: 'Maintains the tight junctions between gut cells. When impaired, bacteria leak through the gut wall ("leaky gut").',
    lifestyleConnection: 'Butyrate (from dietary fiber fermentation) strengthens tight junctions. Alcohol and NSAIDs weaken them.',
    aafiyaInsight: 'Fiber-rich foods feed the bacteria that produce butyrate — the compound that keeps your gut wall sealed tight.',
    category: 'barrier',
    riskLevel: 'moderate',
  },
  {
    gene: 'NKX2-3',
    fullName: 'NK2 homeobox 3',
    pathway: 'Gut development / immune homing',
    role: 'Controls how immune cells travel to and set up in the gut. Variants cause immune cells to accumulate in the wrong spots.',
    lifestyleConnection: 'Anti-inflammatory diet and stress reduction help prevent immune cell over-accumulation.',
    aafiyaInsight: 'When your gut is calm, immune cells behave better — they go where they\'re needed instead of piling up.',
    category: 'immune',
    riskLevel: 'emerging',
  },
];

/**
 * Group genes by their functional category
 */
export function getGenesByCategory(): Record<string, GeneInfo[]> {
  const grouped: Record<string, GeneInfo[]> = {};
  for (const gene of IBD_GENE_DATABASE) {
    if (!grouped[gene.category]) grouped[gene.category] = [];
    grouped[gene.category].push(gene);
  }
  return grouped;
}

/**
 * Get category display info
 */
export const CATEGORY_INFO: Record<string, { label: string; description: string; emoji: string; color: string }> = {
  immune: {
    label: 'Immune Response',
    description: 'Genes that control how your immune system reacts in the gut',
    emoji: '🛡️',
    color: '#E74C3C',
  },
  autophagy: {
    label: 'Cellular Cleanup',
    description: 'Genes that help cells clean up and recycle — activated by sleep and fasting',
    emoji: '🔄',
    color: '#3498DB',
  },
  barrier: {
    label: 'Gut Barrier',
    description: 'Genes that maintain the seal between your gut and bloodstream',
    emoji: '🧱',
    color: '#E67E22',
  },
  microbiome: {
    label: 'Microbiome Balance',
    description: 'Genes that shape which bacteria and fungi live in your gut',
    emoji: '🦠',
    color: '#27AE60',
  },
  signaling: {
    label: 'Inflammation Signals',
    description: 'Genes that control how inflammation is started, amplified, or calmed',
    emoji: '📡',
    color: '#9B59B6',
  },
};

/**
 * Generate genetic context for Aafiya's agent prompt
 */
export function getGeneticContextForAgent(): string {
  let ctx = '\n\nGenetic context (use to inform advice, explain in simple terms if she asks):\n';
  ctx += 'Key genes linked to her condition and what they mean for daily life:\n';

  for (const gene of IBD_GENE_DATABASE.filter(g => g.riskLevel === 'high')) {
    ctx += `- ${gene.gene}: ${gene.aafiyaInsight}\n`;
  }

  ctx += '\nWhen giving food/sleep/lifestyle advice, you can reference these connections naturally. ';
  ctx += 'For example, "fiber feeds the good bacteria that help your gut wall stay sealed" connects PTPN2/NOD2 research to a food choice. ';
  ctx += 'NEVER say gene names unless she specifically asks about genetics. Keep it warm and practical.\n';

  return ctx;
}
