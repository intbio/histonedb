INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(1,
'H2A is one of the core histone types present in all Eukaryotes. H2A forms dimers with H2B via the "hand shake" motif. Two H2A-H2B dimers in turn associate with H3-H4 tetramer to form complete nucleosome core. Structure of H2A consists of a histone fold domain extended by a short αC-helix and has both N- and C-terminal tails. αC-helix and C-terminal tail form "docking domain" that locks the H2A-H2B dimer onto the surface of H3-H4 tetramer [luger_crystal_1997]. It has been suggested that H2A and H2B have arisen from H3 and H4 during evolution [malik_phylogenomics_2003]. H2A histones have the most number of described functional variants.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A',
'type',
'Eukaryotes',
'2759',
1,
null);
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('luger_crystal_1997',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A',
'luger_crystal_1997');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('malik_phylogenomics_2003',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(2,
'H2B is one of the core histone types present in all Eukaryotes. H2B forms dimers with H2A via the "hand shake" motif. Two H2A-H2B dimers in turn associate with H3-H4 tetramer to form complete nucleosome core. It has been suggested that H2A and H2B have arisen from H3 and H4 during evolution [malik_phylogenomics_2003]. Structure of H2B consists of a histone fold with a long flexible N-terminal tail which protrudes between the DNA gyres. H2B interacts with H4 in the nucleosome core via a four helix bundle motif. Addtional αC-helix of H2B decorates the surface of nucleosome. Unlike, H3 and H2A histone, H2B histones have relatively modest number of characterized histone variants. Although in plants, histone H2Bs have undergone significant sequence divergence and expansion in the number of encoding genes [jiang_evolution_2020].',
'Present in all Eukaryotes.',
null,
'It has been suggested that H2A and H2B have arisen from H3 and H4 during evolution [malik_phylogenomics_2003]. The eukaryotic H3-H4 tetramer resembles the tetramer found in Archaea, and it has been suggested that H2A and H2B have arisen from H3 and H4 later on in histone evolution [henneman_structure_2018]. The histone H2B (HTB) family shows the least conservation of all core histones likely because it is less evolutionarily constrained than its counterparts [alvarez-venegas_canonical_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B',
'type',
'Eukaryota',
'2759',
2,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('jiang_evolution_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(3,
'H3 is one of the core histone types present in all Eukaryotes. Two H3 and two H4 histones form H3-H4 tetramer via "hand shake" and "four helix bundle" motifs. Two H2A-H2B dimers then associate with H3-H4 tetramer to form complete nucleosome core. Structurally H3 has a histone fold domain, αN-helix and a long N-terminal tail with many important post-translational modification sites. The αN-helix organizes the terminal segment of core nucleosomal DNA. H3 histone class has evolved to encomass a large number of functionally important H3 histone variants. At least two H3 variants are found in most eukaryotic lineages [malik_phylogenomics_2003].',
'Eukaryotes',
null,
'The H3–H4 tetramer represents a direct structural and perhaps evolutionary link to the archaeal histone tetramer. Distinct variants of H3 have been usurped for special roles in transcription and even chromosome segregation, whereas H4’s role has remained constant throughout eukaryotic evolution [malik_phylogenomics_2003]. H3 and H4 are more similar to archaeal histones than H2A and H2B, supporting this hypothesis [henneman_structure_2018]. The fact that eukaryotic cells undergo mitosis, in which chromosomes are highly compacted, together with the abundance of gene-poor regions may have favored a histone conformation that wraps DNA twice (eukaryotic octamer) instead of once (archaeal tetramer) and that via its N-terminal tails has the ability to compact DNA at ahigher order [henneman_structure_2018].',
null,
null,
null,
null,
null,
null,
'The two-fold symmetry of the eukaryotic nucleosome is organized along the dimerization interface of the two H3 molecules using their C-terminal ends, an example of a four-helix bundle motif. Apart from its heterodimerization with H4, H3 also makes contacts with H2A and has at least two segments of specific contact with the nucleosomal DNA: just upstream of the alpha-N helix where the H3 tail enters the nucleosome between the DNA gyres, and in the loop 1 region [malik_phylogenomics_2003].',
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3',
'type',
'Eukaryotes',
'2759',
3,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(4,
'H4 is one of the core histones. Two H4s and two H3s form H3-H4 tetramer via "hand shake" and "four helix bundle" motifs. Two H2A-H2B dimers then associate with H3-H4 tetramer to form complete nucleosome core. H4 is the most conservative histone type and has very few known variants. Structure of H4 has a histone fold domain and a flexible N-terminal tail. H4 provides sites for H2B interaction via "four-helix bundle" and forms a small β-sheet with H2Aa.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H4',
'type',
null,
null,
4,
null);
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(5,
'H1 is the linker histone. Associates with the nucleosome core and linker DNA near the DNA entry-exit points. The resulting particle is called chromatosome. H1-histone is lysine rich, has long disordered C-terminal tail and a short N-terminal tail. The globular domain has three helices and a wing, so-called "winged helix" motif.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1',
'type',
null,
null,
5,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('Archaeal',
'type',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('Viral',
'type',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(6,
'cH2A  canonical H2A histones. This is a loosely defined group that encompasses major H2A histone proteins that are mainly expressed during S-phase of the cell cycle in eukaryotes and are highly conserved even between distantly related species. Such proteins are often called replication dependent (RD), replication coupled (RC), clustered or "bulk" histones [marzluff_metabolism_2008,talbert_histone_2021]. They are likely similar to the original H2A histones of the last common ancestor of eukaryotes [malik_phylogenomics_2003], although a similar H2A.X variant might have been also ancestral [talbert_histone_2021]. Expression of canonical histones during S-phase is often tightly regulated, but mechanisms may differ among kindoms [marzluff_birth_2017,pontarotti_long-term_2009]. Canonical histone genes are often present as large mulrigene families clustered together in certain locations of the genome. However, there are known limitations to the definition given above. Functional diversification of paralogous genes is a common process in evolution  in many species multiple copies of canonical histone genes have undergone diversification in terms of sequence variation, cell-cycle or tissue-specific expression patterns. Sometimes this diversification is very subtle and species-specific (e.g. cH2A isoforms in human), in other cases there may be a spectrum of canonical-like proteins (e.g. plant canonical H2As which show higher sequence diversity than cH2Bs of animals). Hence, whether a particular gene should be regarded as a canonical, a bona fide variant or a canonical subvariant/isoform may be a matter of debate and definition in each particular case. Within the current hierarchical classification system, additional information about the cH2A class may be gained by looking at the description of its subclasses. ',
'Present in all Eukaryotes.',
null,
'Because of its conserved function in the DNA damage response, it seems probable that H2A.X is ancestral, and that the various RC H2As are derived from it [talbert_histone_2021].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
'In certain species H2A.X may perform cH2A role, hence in our classification such species will lack cH2A histones. In single-celled eukaryotes, such as yeast, H2A.X can be the primary form of H2A [talbert_histone_2021]. The same might apply to certain protozoan parasites, such as G. lamblia [dalmasso_canonical_2011].');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A',
'variant_group',
'Eukaryota',
'2759',
6,
'H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('marzluff_metabolism_2008',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('talbert_histone_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('marzluff_birth_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('pontarotti_long-term_2009',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(1,
'canonical H2A',
null,
null,
null,
'cH2A');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(7,
'H2A.Z  is a replication-independent H2A histone variant strongly conserved in almost all Eukaryotes (exceptions may include some  metamonads (e.g. Giardia, Trichomonas), Amebae and parasitic fungi [dalmasso_canonical_2011]). This histone variant is essential from Tetrahymena to mammals (although its knock out in yeast is not lethal) and amounts to around 5-10% of H2A histones [dalmasso_canonical_2011]. H2A.Z containing nucleosomes often localize near transcription start sites (+1 nucleosomes) and enhancer regions, they are thought to be involved in Pol II recruitment, transcription regulation, DNA repair, suppression of antisense RNA, heterochromatin regulation.  [giaimo_histone_2019]. H2A.Z nucleosomes have a larger acidic patch, an amino acid insertion in α1-helix and one deletion in the docking domain compared to the canonical H2A. The L1-loop region exhibits four amino acids difference between H2A.Z and canonical H2A and is likely involved in conferring stability and functional specificity of variant nucleosomes via L1-L1 interactions [shaytan_nucleosome_2015]. C-terminal region of the yeast H2A.Z protein interacts with RNA polymerase II (RNAPII), promoting its recruitment at promoters [adam_h2az_2001].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z',
'variant_group',
'Eukaryotes',
'2759',
7,
'H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('giaimo_histone_2019',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('colino-sanguino_h2az-nuclesome_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('22650316',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'22650316');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('25731851',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'25731851');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('11101893',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'11101893');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('18275809',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'18275809');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('24311584',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'24311584');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('19193230',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'19193230');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('24969791',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'24969791');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('22467210',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'22467210');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('20003410',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'20003410');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('24768041',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'24768041');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('23301656',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'23301656');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('20197778',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'20197778');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('dalmasso_canonical_2011',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'dalmasso_canonical_2011');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('shaytan_nucleosome_2015',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'shaytan_nucleosome_2015');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('adam_h2az_2001',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z',
'adam_h2az_2001');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(2,
'Htz1p',
'saccharomyces',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(3,
'hv1',
'tetrahymena',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(4,
'H2A.V',
'drosophila',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(5,
'H2Av',
'drosophila',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(6,
'H2AvD',
'drosophila',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(7,
'D2',
'drosophila',
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(8,
'member Z',
null,
null,
null,
'H2A.Z');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(8,
'H2A.X   is an H2A histone variant present in almost all Eukaryotes most notably involved in DNA damage response, marking the double strand DNA breaks with its phosphorylated form ɣ-H2A.X. It is also more broadly implicated in chromatin remodeling, found at collapsed replication forks and heterochromatin. It is a non-monophyletic (polyphyletic) variant  of H2A and has the charactristic SQE/DΦ motif at C-terminus (SQAY in Drosophila), where Φ-represents a hydrophobic residue (usually Tyr in mammals), and S is phosphorylation site. In multicellular eukaryotes H2A.X is usually closely related to  cH2As in the same group of multicellular organisms [millar_organizing_2013, talbert_histone_2021]. It seems likely that H2A.X was ancestral to cH2As due to its conserved role in DNA damage response [talbert_histone_2010]. Caveats: Nematodes are the only known species that lack H2A.X. Many fungi lack canonical H2A its role is fullfiled by H2A.X. In Drosophila melanogaster H2A.X function is fullfiled by H2A.Z histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X',
'variant_group',
'Eukaryotes',
'2759',
8,
'H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'22650316');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'25731851');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('18095327',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'18095327');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'23301656');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('millar_organizing_2013',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'millar_organizing_2013');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' talbert_histone_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
' talbert_histone_2021');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('talbert_histone_2010',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.X',
'talbert_histone_2010');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(9,
'member X',
null,
null,
null,
'H2A.X');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(9,
'macroH2A is the largest replication independent H2A histone variant characterized by an additional non-histone ~30 kDa macro domain connected to the C-end of the  histone fold via an unstructured linker. MacroH2A is conserved and widespread in vertebrates, but also found in invertebrates. MacroH2A is involved in heterochromatin formation, X-inactivation and transcriptional regulation. MacroH2A is broadly distributed across the genome, found at H3K27me3-decorated faculatative heterochromatin, constitutive heterochromatin regions, is incorporated at sites of DNA damage.  Macro domains may be capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose. Mammals have two macroH2A genes (macroH2A.1 and macroH2A.2 in humans) [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A',
'variant_group',
'Metazoa',
'33208',
9,
'H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'22650316');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'25731851');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('16107708',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'16107708');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('20543561',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'20543561');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('16803903',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'16803903');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('sun_histone_2019',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(10,
'mH2A',
null,
null,
null,
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(11,
'macroH2A1',
null,
'1',
null,
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(12,
'macroH2A2',
null,
'2',
null,
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(13,
'macroH2A1.1',
null,
'1',
'1',
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(14,
'macroH2A1.2',
null,
'1',
'2',
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(15,
'macroH2A2.1',
null,
'2',
'1',
'macroH2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(16,
'macroH2A2.2',
null,
'2',
'2',
'macroH2A');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(10,
'short_H2A is a class encompassing several histone H2A variants in placental (eutherian) mammals with shortened C-terminus expressed mainly during mammalian male germ cell development before the nearly complete replacement of histones by protamines in sperm nuclei. The repertoires of short histone H2A variants vary extensively among eutherian mammals due to lineage-specific gains and losses. Short H2A variants include H2A.B, H2A.L, H2A.P, H2A.Q, their genes are usually located on X chromosome and are intronless. These four clades of eutherian mammal short H2A variants emerged from a single, well-supported monophyletic clade, confirming their common ancestry [molaro_evolutionary_2018]. Due to shortened docking domain and changes within the acidic patch nucleosomes incorporating short H2As wrap less DNA (120-130 bp) and form loosely packed chromatin. There are few conserved residues in the histone fold domain of sH2As that distinguish them from each other, instead much of their specialization may stem from changes in the N- and C-terminal tails of these variatns [molaro_evolutionary_2018].  Abberant short H2A upregulation was reported in a broad range of cancers [chew_short_2021]. Caveats: H2A.B is also expressed in the brain [jiang_short_2020].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('short_H2A',
'variant_group',
'Eutheria',
'9347',
10,
'H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('molaro_evolutionary_2018',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('short_H2A',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('chew_short_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('short_H2A',
'chew_short_2021');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('jiang_short_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('short_H2A',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(17,
'sH2A',
null,
null,
null,
'short_H2A');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(11,
'H2A.R - is a histone variant found currently in monotremes and marsupials, it is an intermediate between the eutherian short histone H2A variants and canonical H2A. Evolutionary analysis suggests that ancestor histone H2A variant branched out to H2A.R (still possessing a C-terminus) in monotremes and marsupials, and to the four classes of the short histone H2A variants in eutherian mammals. H2A.R histone variants have variable N-terminus, altered charge of the histone fold domain, divergent L1-loop, altered acidic patch and extended C-terminal tail. Platypus and opossum H2A.R variants are expressed in the testis but not in other tissues we examined, including opossum ovary. Molaro et al. concluded that expression analysis allows to infer that testis-specific expression preceded the divergence of H2A.R and eutherian short histone H2A variants and is a common feature of all these genes. It is currently unclear whether the common ancestor of H2A.R and the short H2As was autosomal or sex chromosome-linked [molaro_evolutionary_2018].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.R',
'variant_group',
'Mammalia',
'40674',
11,
'H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.R',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(12,
'H2A.J is a poorly studied replication independent H2A histone variant very similar in sequence to canonical H2A histones. It was characterized in human and mouse, similar genes are present in other mammals. It has been implicated in cell senesecence. Genes: In human it is encoded by H2AJ gene on chormomosome 12, in mouse by H2aj gene on chromosome 6. Both genes are intronless. H2aj gene lacks a stem-loop structure at the 3''-UTR but contains a poly (A) signal [nishida_novel_2005]. Similar genes are found in other mammals [contrepois_histone_2017]. Evolution: no studies available. Knock-out: Depletion of H2A.J via RNA interference modifies senesecence-associated chromatin re-structuring and abolishes senesecence-associated secretory phenotype in human fibroblasts subject to ionizing radiation [isermann_histone_2020]. Function, disease: It has been shown that H2A.J accumulates in senescent cells and promotes inflammatory gene expression [isermann_histone_2020,contrepois_histone_2017]. Sequence: It differs from canonical H2A protein sequences only by an A11V substitution and the presence of an SQK motif near the C-terminus, which is a potential phosphorylation site [talbert_histone_2021]. Localization: In fibroblast irradiation experiments it was shown that H2A.J colocalizes with 53BP1 and is incorporated at the periphery of so-called senesecence-associated chromatin foci (SAHF) [isermann_histone_2020]. Deposition: unclear. Structural effects: sequence changes lie only within the histone tails, alterations to the C-terminal tail may theoretically alter interactions with linker DNA and H1-histone, but this has not been studied. Interactions: colocalizes with 53BP1 [isermann_histone_2020].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.J',
'variant_group',
'Mammalia',
'40674',
12,
'H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.J',
'25731851');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('nishida_novel_2005',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.J',
'nishida_novel_2005');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('contrepois_histone_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.J',
'contrepois_histone_2017');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('isermann_histone_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.J',
'isermann_histone_2020');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.J',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(13,
'H2A.W is a plant specific variant found in angiosperms (flowering plants) having a potentially DNA minor-groove-binding SPKK (sometime reffered to as KSPKKA) motif within its C-terminal tail, it is enriched in heterochromatin and implicated in gene silencing and DNA damage response.',
'H2A.W variant is found exclusively in angiosperms [alvarez-venegas_canonical_2019].',
'Arabidopsis has three H2A.W genes (HTA6, HTA7, and HTA12) endoding three isoforms, rice genome has four genes (HTA701, HTA706, HTA707, and HTA710) encoding three isoforms. Isoforms endoded by different genes may have different number of SPKK motifs. A single copy of the SPKK motif seems to be true for all eudicots, whereas the monocots have been shown to possess 2 or even 3 copies of the same motif [alvarez-venegas_canonical_2019,kawashima_diversification_2015].',
'H2A.W is a plant-lineage-specific variant that may have arisen early in the evolution of spermatophytes or seed plants. H2A.W lacks homologs in unicellular green algae, liverworts, mosses, and lycophytes but has distinctive homologs in early spermatophytes from the genus Ginkgo, Cycas, and Gnetum [alvarez-venegas_canonical_2019,kawashima_diversification_2015]. Instead of H2A.W homologs, Kawashima et al. identified a novel group of related H2A variants, they named H2A.M, in the genomes of liverworts, mosses, and lycophytes [kawashima_diversification_2015]. Whether H2A.M and H2A.W emerged from the same ancestor or H2A.M in early basal land plants evolved gradually to become H2A.W in seed plants remains undetermined [alvarez-venegas_canonical_2019,kawashima_diversification_2015].',
'In Arabidopsis HTA6 and HTA7 were found to have S-phase specific expression during the cell cycle, while H2A12 did not manifest any specific cell-cycle expression peak [alvarez-venegas_canonical_2019,menges_genome-wide_2003].',
null,
'H2A.W participates in constitutive heterochromatin formation, particularly pericentric heterochromatin [yelagandula_histone_2014]. H2A.W.7 (HTA7 gene) in Arabidopsis was shown to be involved in DNA damage response. It contains an SQ motif within C-terminal tail, which is phosphorylated by ATM kinase upon DNA damage [lorkovic_compartmentalization_2017].',
'A characteristic feature of H2A.W sequences is the presence of one or multiple SPKK motifs within its long C-terminal tail. The SPKK motif was reported to preferentially bind AT-rich DNA, which is a feature of pericentric heterochromatin occupied by H2A.W in Arabidopsis [churchill_spkk_1989]. H2A.W variants also have significant sequence alerations within L1-loop and docking domain, which influence nucleosome stability [osakabe_histone_2018]. L1-loop of flowering plants contains (RYA/SK/Q) motif [kawashima_diversification_2015].',
'Genome-wide analysis showed that H2A.W variants localize with heterochromatin, transposable elements, H3K9me2-rich regions [yelagandula_histone_2014].',
'Specific deposition mechanism are not known. Certain H2A.W are desposited during S-phase in a replication-dependent manner, while others manifest replication-independent deposition [alvarez-venegas_canonical_2019].',
'The extended C-terminal tail of H2A.W interacts with linker DNA and protects DNA from the cleavage by MNase [osakabe_histone_2018]. H2A.W may facilitate heterochromatin formation by promoting long-range interactions between nucleosomes, an activity that requires the long C-terminal tail domain containing a SPKK motif [alvarez-venegas_canonical_2019,yelagandula_histone_2014]. Replacement of H2A.W L1-loop with the corresponding sequence from H2A does not affect nucleosome stability [osakabe_histone_2018].',
'It was hypothesized that C-terminal tail of H2A.W may impact H1 binding [osakabe_histone_2018].',
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.W',
'variant_group',
'Magnoliopsida',
'3398',
13,
'H2A');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(18,
'H2A with SPKK motifs',
null,
null,
null,
'H2A.W');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(14,
'H2A.M is a plant specific variant related to H2A.W found in non-flowering plants such as liverworts, mosses, and lycophytes. H2A.M variants are characterized by having a long C-terminal tail domain, rich in lysine, serine and acidic residues, not present in the other H2A variants. The variant was described by Kawashima et al. [kawashima_diversification_2015].',
'H2A.M was characterized in genomes of liverworts, mosses, and lycophytes[kawashima_diversification_2015].',
null,
'Certain similarities between the C-terminal tail and the L1-loop of H2A.M and H2A.W variants and the clustering of H2A.M and H2A.W proteins in the phylogeny of H2A suggest that these two variants are related. Whether H2A.M and H2A.W emerged from the same ancestor or H2A.M in early basal land plants evolved gradually to become H2A.W in seed plants remains undetermined [alvarez-venegas_canonical_2019,kawashima_diversification_2015].',
null,
null,
null,
'In the L1 loop, all H2A.M variants share the motif RYAK/Q. The N-terminal tails of H2A.Ms lack a stretch of lysine and glycine residues that is present in H2A.W variants, and are therefore shorter [kawashima_diversification_2015].',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.M',
'variant_group',
'Viridiplantae',
'33090',
14,
'H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('kawashima_diversification_2015',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.M',
'kawashima_diversification_2015');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(15,
'gH2A is a male-gamete-specific variant found in the genus Lilium [alvarez-venegas_canonical_2019,ueda_male_2005].',
'Suggested to be a distinctive variant that evloved specifically in Lilium [alvarez-venegas_canonical_2019]',
'gH2A gene in Lilium longiflorum. The gene is interrupted by one intron.',
null,
null,
null,
'This histone variant is expected to be specifically synthesized in the male gametic cells and to cause chromatin condensation or remodeling of chromatin structure [ueda_male_2005].',
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('gH2A',
'variant_group',
'Lilium',
'4688',
15,
'H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('alvarez-venegas_canonical_2019',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2A',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('ueda_male_2005',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2A',
'ueda_male_2005');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(16,
'cH2B  canonical H2B histones. Like cH2A, this is a loosely defined group that encompasses major H2B histone proteins that are expressed during S-phase of the cell cycle in eukaryotes and are highly conserved even between distantly related species. Such proteins are often called replication dependent (RD) or "bulk" histones [marzluff_metabolism_2008,talbert_histone_2021]. They are likely similar to the original H2B histones of the last common ancestor of eukaryotes [malik_phylogenomics_2003]. Expression of cH2Bs during S-phase is often tightly regulated, but mechanisms may differ among kindoms [marzluff_birth_2017,pontarotti_long-term_2009]. These histones are often present as large multigene families. However, there are known limitations to the definition given above. Functional diversification of paralogous genes is a common process in evolution  in many species multiple copies of canonical histone genes have undergone diversification in terms of sequence variation, cell-cycle or tissue-specific expression patterns. Sometimes this diversification is very subtle and species-specific (e.g. cH2B.E isoforms in mouse), in other cases there may be a spectrum of canonical-like proteins (e.g. plant canonical H2Bs which show higher sequence diversity than cH2Bs of animals). Hence, whether a particular gene should be regarded as a canonical, a bona fide variant or a canonical subvariant/isoform may be a matter of debate and definition in each particular case. Within the current hierarchical classification system, additional information about the cH2A class may be gained by looking at the description of its subclasses.',
'Present in all Eukaryotes.',
null,
'It has been suggested that H2A and H2B have arisen from H3 and H4 during evolution [malik_phylogenomics_2003]. The eukaryotic H3-H4 tetramer resembles the tetramer found in Archaea, and it has been suggested that H2A and H2B have arisen from H3 and H4 later on in histone evolution [henneman_structure_2018].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B',
'variant_group',
'Eukaryota',
'2759',
16,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(17,
'H2B.L (also named subH2B)  is an unusual H2B variant found outside of the nucleus in the in the subacrosomal space of spermatozoa. First characterized as a major component of the subacrosomal layer of the perinuclear theca (SAL-PT) in bulls sperm heads (named subH2Bv) [aul_major_2001]. SAL-PT resides within in the layer of condensed cytosol between acrosome and the nucleus of the spermatid [tran_involvement_2012]. N-terminal tail of subH2Bv contains a bipartite nuclear localization signal (bNLS) [tran_involvement_2012]. A study be Tran et al. suggested that this bNLS allows subH2Bv during spermiogenesis to target proacrosomic and acrosomic vesicles to the nuclear envelope by binding to the nucleocytoplasmic receptor KPNA [tran_involvement_2012]. In mouse Govin et al. have identified a homologous protein, which was named H2BL1, which was shown to accumalate in late spermiogenesis in condensing spermatids [govin_pericentric_2007]. Although when expressed ectopically fused with EGPFP the protein enters cell nucleus, it is has not been seen developmentally within the nucleus of the spermatid [tran_involvement_2012]. Thus currently there is no evidence that subH2B participates in nucleosome formation. The currently suggested name for this variant is H2B.L [raman_novel_2022].',
'Likely mammals, characterized mainly in bull and mouse. In Homininae the gene is pseudogenised (H2BL1P pseudogene in human). Gene is pseudogenised also in many primates [raman_novel_2022].',
'H2bl1 in mouse.',
'Human genome appears to encode a H2B.L pseudogene, which is a single mutation away from encoding an intact ORF. Frameshifting mutation (and subsequent early stop codon) found in humans is also present in chimpanzee, bonobo, and gorilla, suggesting that a true pseudogenization event occurred around 9 Ma in Homininae [raman_novel_2022].',
null,
null,
null,
'In mouse is around 40% identical to canonical H2B histone. The most divergent part is its unique N-terminal tail, which contains a bipartite nuclear localization signal [tran_involvement_2012]. Protein length in mouse is 122 aa (without initiator methionine), compared to 125 aa for canonical H2B.',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.L',
'variant_group',
'Mammalia',
'40674',
17,
'H2B');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('11892742',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'11892742');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('22156475',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'22156475');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('aul_major_2001',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'aul_major_2001');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('tran_involvement_2012',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'tran_involvement_2012');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('govin_pericentric_2007',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('raman_novel_2022',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.L',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(19,
'subH2B',
null,
null,
null,
'H2B.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(20,
'H2BL1',
null,
null,
null,
'H2B.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(21,
'subH2Bv',
null,
null,
null,
'H2B.L');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(18,
'H2B.W  is a testis-specific histone variant involved in spermiogenesis. It was suggested to have telomere-associated functions and participate in the telomere-binding complex in the human sperm [churikov_novel_2004, gineitis_human_2000]. It has a long extended N-terminal tail, has about 45% amino acid sequence identity and 70% similarity with both the major somatic H2Bs [churikov_novel_2004]. First, characterized in human as H2BFWT gene (now called H2BW1 gene). In mouse a paralog of H2B.W variant was initially identified by Govin et al. and named H2BL2 [govin_pericentric_2007]. In human beings, unlike other mammals including the mouse, core histones (H2A, H2B, H3 and H4) are not displaced completely during spermiogenesis and account for approximately 15% of the basic chromosomal proteins within the mature sperm [lee_functional_2009]. At least human H2B.W can replace conventional histone H2B in the nucleosome, does not affect the overall structure and stability of the nucleosome [boulard_nh2_2006]. In contrast to conventional H2B, H2B.W was unable to recruit chromosome condensation factors and to participate in the assembly of mitotic chromosomes, this fact is attibuted to its highly divergent NH2 tail [boulard_nh2_2006].',
'Mammals',
'Human has two H2B.W-encoding paralogs which are now named as H2BW1 and H2BW2 and two pseudogenes (H2BW3P and H2BW4P) all located on the X chromosome between RAB9B and SLC25A3, while mouse has only one H2B.W-encoding gene (H2bw2) found in a syntenic location. Other mammals have different numbers of H2BW paralogs (between 1 and 4) but these are all located at the same conserved location of the X chromosome [Ruth et al]. The H2BFWT gene contains two introns and is transcribed exclusively in testis, where the spliced polyadenylated mRNA was detected [churikov_novel_2004].',
null,
null,
null,
null,
'',
null,
null,
null,
null,
'Single nucleotide polymorphisms (SNPs) in H2B.W genes may result in male infertility. See meta-analysis of several studies by Teimouri et al. [teimouri_association_2018].',
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.W',
'variant_group',
'Mammalia',
'40674',
18,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'11892742');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'22156475');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('churikov_novel_2004',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'churikov_novel_2004');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' gineitis_human_2000',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
' gineitis_human_2000');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('lee_functional_2009',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'lee_functional_2009');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('boulard_nh2_2006',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W',
'boulard_nh2_2006');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(22,
'H2BFWT',
null,
null,
null,
'H2B.W');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(23,
'member W',
null,
null,
null,
'H2B.W');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(24,
'type W-T',
null,
null,
null,
'H2B.W');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(25,
'H2BL2',
null,
null,
null,
'H2B.W');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(26,
'spH2B',
null,
null,
null,
'H2B.W');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(19,
'H2B.K  is a variant identified so far bioinfomatically by Raman et al. as phylogenetically distinct clade of H2B variants in bony vertebrates [raman_novel_2022]. Newly identified histones H2B.N and H2B.K are primarily expressed in ovaries and early embryos, where they may play key roles in female fertility and early development like the cleavage stage histones of sea urchins. Certain changes that distinguish H2B.K from canonical H2B occur around the second DNA binding loop that could affect DNA binding or specificity. H2B.K’s N-terminal tail differs dramatically from canonical H2B [raman_novel_2022]. N-terminal tail is missing key lysine residues that are posttranslationally modified in canonical H2B. Atypically for H2B proteins, H2B.K also has a variable-length polyglutamine tract in its N-terminal tail that could facilitate protein–protein interactions. H2B.K is a newly identified histone variant, its biochemical properties remain uncharacterized [raman_novel_2022].',
'Bony vertebrates [raman_novel_2022].',
'An unusual feature of both H2B.K and H2B.N is that they are encoded by intron-containing genes, whereas all other H2B variants and canonical H2B lack introns [raman_novel_2022].',
'H2B.K may have a common ancestor with H2B.N. H2B.K is the only H2B variant for which Raman et al. could identify an ortholog in the shared syntenic location in chicken, a nonmammalian outgroup. They found H2B.K orthologs at least as far back as bony fishes in shared syntenic locations. H2B.K orthologs from vertebrates also group with the previously identified cleavage-stage dependent histones in sea urchin. Both H2B.K and H2B.N were pseudogenized in rodents. Both H2B.K and H2B.N were pseudogenized in rodents. [raman_novel_2022].',
'H2B.K is expressed in ovaries of opossum, dog, and humans, chicken, whereas H2B.K is expressed in both testes and ovaries in pig. Ovarian expression of H2B.K likely predates the divergence of birds and mammals. Analyses of human oogenesis revealed robust expression of H2B.K and H2B.N in oocytes, with levels increasing across oogenesis. Neither H2B.K nor H2B.N were detected in granulosa cells, which are the somatic cells of the female germline, suggesting again that expression is restricted to the germline. pol(A) signal is detected in the 3-prime-UTR of most H2B.K genes [raman_novel_2022].',
null,
null,
'',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.K',
'variant_group',
'Euteleostomi',
'117571',
19,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.K',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(20,
'H2B.N  is a variant identified so far bioinfomatically by Raman et al. as phylogenetically distinct clade of H2B variants in mammals [raman_novel_2022]. Newly identified histones H2B.N and H2B.K are primarily expressed in ovaries and early embryos, where they may play key roles in female fertility and early development like the cleavage stage histones of sea urchins. H2B.N shares less then 50% identity with canonical H2Bs in the histone fold domain. Although H2A-, H4-interacting residues, and residues in L2 are largely conserved between H2B.N orthologs, they are highly divergent from cH2Bs. H2B.N orthologs are significantly truncated in their C-terminus. Removing the alpha-C domain eliminates the important nucleosome acidic patch that mediates many other chromatin interactions. This suggests that the unusual H2B.N could endow nucleosomes with unique properties, or that H2B.N might have evolved nonnucleosomal functions, like H2B.L [raman_novel_2022]. H2B.N is a newly identified histone variant, its biochemical properties remain uncharacterized [raman_novel_2022].',
'Mammals [raman_novel_2022].',
' An unusual feature of both H2B.K and H2B.N is that they are encoded by intron-containing genes, whereas all other H2B variants and canonical H2B lack introns. Like most mammals, H2B.K and H2B.N are present in single copy in all primates, whereas H2B.1 and H2B.W are present in mul- tiple copies [raman_novel_2022].',
'H2B.K may have a common ancestor with H2B.N. Analysis by Raman et al found that H2B.L and H2B.N contain marsupial and platypus (but not chicken) sequences, and therefore arose in the last common ancestor of all mammals. Both H2B.K and H2B.N were pseudogenized in rodents.  [raman_novel_2022].',
'H2B.N was found to be expressed in ovaries of opossum, dog, and humans. Analyses of human oogenesis revealed robust expression of H2B.K and H2B.N in oocytes, with levels increasing across oogenesis. Neither H2B.K nor H2B.N were detected in granulosa cells, which are the somatic cells of the female germline, suggesting again that expression is restricted to the germline. pol(A) signal is detected in the 3-prime-UTR of most H2B.N genes [raman_novel_2022].',
null,
null,
'',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.N',
'variant_group',
'Mammalia',
'40674',
20,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.N',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(21,
'H2B.O  is a class of H2B sequences identified exclusively in platypus genome that group together in phylogenetic analysis. H2B.O expression appears to be enriched in platypus’ germline tissues (testes or ovaries) albeit at low levels [raman_novel_2022].',
'Platypus [raman_novel_2022].',
null,
null,
'H2B.O expression appears to be enriched in platypus’ germline tissues (testes or ovaries) albeit at low levels [raman_novel_2022].',
null,
null,
'',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.O',
'variant_group',
'Ornithorhynchus anatinus',
'9258',
21,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.O',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(22,
'H2B.S  is a class a new class of highly divergent H2B variants identified by Jiang et al. that specifically accumulate during chromatin compaction of dry seed embryos in multiple species of flowering plants [jiang_evolution_2020].',
'Flowering plants (angiosperms) [jiang_evolution_2020]',
'HTB8 gene in Arabidopsis, Solyc06g074750.1 in tomato, LOC_Os09g39730 in rice.',
'Despite forming a distinct angiosperm-specific clade, H2B.S variants show a high degree of variation, even amongst closely related genera. Other highly divergent sequences from Streptophyte algae and gymnosperms form a grade basal to H2B.S variants, suggesting a deeper evolutionary origin, which cannot be currently analyzed due to the lack of conserved substitutions and similar sequences in bryophytes, lycophytes and ferns [jiang_evolution_2020].',
'Arabidopsis HTB8 is specifically expressed in sperm and mature embryos. Unlike Arabidopsis HTB8, expression in anthers, pollen or sperm cells was not evident neither in rice nor maize [jiang_evolution_2020].',
null,
'For Arabidopsis an adaptive function in cell types that become desiccated, quiescent or show higher degrees of chromatin compaction has been suggested [jiang_evolution_2020].',
'The angiosperm-specific clade of Arabidopsis HTB8 orthologs were characterized by conserved substitutions in the histone core, slightly extended C-terminal tails and greatly expanded N-terminal tails with a KVVXETV motif [jiang_evolution_2020].',
null,
null,
'Two HTB8 residues, Arg152 and Met179, were highly conserved among HTB8 orthologs  and were positioned in such a way that they might contribute to stronger interactions with DNA and histone H2A, respectively. These and other observations suggest that sequence divergence in HTB8 impact intra-nucleosomal interactions to potentially alter nucleosome structure and/or stability [jiang_evolution_2020].',
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.S',
'variant_group',
'Magnoliopsida',
'3398',
22,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.S',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(23,
'gH2B is a group of plant H2B variants found in Lilium that are highly divergent from the canonical H2B and are expressed in the generative cell of the bicellular pollen where it may be necessary for chromatin remodeling of the male germline [alvarez-venegas_canonical_2019,yang_proteomic_2016,ueda_unusual_2000]. The subvariants so far identified are named gH2B in Lilium longiflorum, mgH2B in Lilium davidii, and mgH2B.in in Lilium davidii. These subvariants are rather different and are grouped due to lack of further information. Some phylogenetic reconstructions cluster these variant together with H2B.S [alvarez-venegas_canonical_2019], however, this may be likely to long branch attraction, and the exact phylogeny remains to be studied [jiang_evolution_2020].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('gH2B',
'variant_group',
'Lilium',
'4688',
23,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2B',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('yang_proteomic_2016',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2B',
'yang_proteomic_2016');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('ueda_unusual_2000',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2B',
'ueda_unusual_2000');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('gH2B',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(24,
'H2B.Z is an apicomplexan specific variant. Different studies performed in Toxoplasma have shown a nucleosome composition in which H2A.Z, but not H2A.X, dimerizes with H2B.Z, while H2A.X dimerizes with canonical H2B (H2Ba in T. gondii), but never with H2B.Z. This fact is also seen in P. falciparum, although this parasite lacks H2A.X variant and has driven the hypothesis of a new double variant nucleosome exclusive of parasites with particular characteristics [logie_apicomplexa_2020].',
null,
null,
null,
' H2B.Z expression was found to be relatively constitutive, showing only slight decrease in early and mid-trophozoites [miao_malaria_2006].',
null,
null,
null,
null,
null,
null,
null,
null,
'Former name for this histone variant H2Bv from Plasmodium can be confused with H2BV from Trypanosoma, though the two variants are not closely related.');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.Z',
'variant_group',
'Apicomplexa',
'5794',
24,
'H2B');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('logie_apicomplexa_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.Z',
'logie_apicomplexa_2020');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(27,
'H2Bv',
null,
null,
null,
'H2B.Z');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(25,
'H2B.V is a histone variant characterized so far in Trypanosoma brucei. It shares ~38% sequence identity with major H2B. H2B.V is essential for viability. H2A.Z and H2B.V colocalize throughout the cell cycle and exhibit nearly identical genomic distribution. Data strongly suggest that H2A.Z and H2B.V function together within a single nucleosome [lowell_histone_2005]. H2BV possibly regulates H3 K4 and K76 trimethylation in Trypanosoma brucei [mandava_trypanosome_2008].',
'Trypanosoma',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.V',
'variant_group',
'Trypanosoma',
'5690',
25,
'H2B');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('lowell_histone_2005',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.V',
'lowell_histone_2005');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(28,
'H2BV',
null,
null,
null,
'H2B.V');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(26,
'CS_H2B_(Echinoidea) is a histone variant class containing cleavage-stage (CS) H2B histones characterized so far in sea urchins. Four classes of histones in sea urchins have been characterized. Three sets of histone variants are coexisting in the embryo at larval stages of sea urchin’s development: the maternally inherited cleavage stage variants (CS) expressed during the two initial cleavage divisions, the early histone variants, which are recruited into embryonic chromatin from middle cleavage stages until hatching and the late variants, that are fundamentally expressed from blastula stage onward [oliver_conservative_2003]. The fourth class of histones in sea urchins are the sperm histones. They are exclusively transcribed during spermatogenesis and code for specialized H1 and H2B proteins with basic N-terminal extensions which are responsible for the unusually high chromatin condensation in mature sperm [mandl_five_1997]. Early, late, and sperm histone genes lack introns, contain the conserved 3-prime terminal stem-loop structure instead of a poly(A) addition site, and thus show the classical hallmarks of replication-dependent histone genes. The CS proteins are the first histones to be synthesized after fertilization in the cleaving embryo. The CS histones appear to be synthesized during oogenesis and in the mature egg, where they give rise to a large maternal pool of histone proteins. The CS proteins are the only histones present in the chromatin of the egg and zygote up to the second cell division. Thereafter, the efficient synthesis of the early histones leads to a rapid dilution of the CS histones in the chromatin except in the nondividing small micromeres, where the CS proteins remain the major histones up to the pluteus larva stage. The maternally stored CS histones play an important role in remodeling of the sperm chromatin after fertilization. Upon entry in the egg cytoplasm, the sperm H1 and H2B proteins present in the male pronucleus are rapidly phosphorylated on their N-terminal extensions, and the sperm H1 protein is subsequently replaced in the chromatin by the CS H1 protein. This exchange of H1 histones is immediately followed by decondensation of the chromatin. At around the time of DNA replication, the CS H2A and H2B proteins start to accumulate in the chromatin of the male pronucleus, which correlates with the transition of the nucleosomal repeat length from 250 bp in the sperm chromatin to 200 bp in the early embryo. As a consequence of this massive chromatin restructuring, the paternal genome is transcriptionally activated already at the beginning of S phase in the first cell cycle, which further emphasizes the importance of the CS histones for early development [mandl_five_1997].',
'Echinoidea (sea urchins)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'It is likely, that CS_H2B homologs are present in other taxonomic clades. Raman et al. suggested that newly identified histones H2B.N and H2B.K which are primarily expressed in ovaries and early embryos of mammals and may play key roles in female fertility and early development may be related to the cleavage stage histones of sea urchins [raman_novel_2022]. Other CS histones, such as CS H1 in sea urchins are functionally equivalent to frog H1M(B) proteins [mandl_five_1997].');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('CS_H2B_(Echinoidea)',
'variant_group',
'Echinoidea',
'7625',
26,
'H2B');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('oliver_conservative_2003',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('CS_H2B_(Echinoidea)',
'oliver_conservative_2003');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('mandl_five_1997',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('CS_H2B_(Echinoidea)',
'mandl_five_1997');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(29,
'cleavage H2B',
null,
null,
null,
'CS_H2B_(Echinoidea)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(27,
'early_H2B_(Echinoidea) is a histone variant class of early H2B histones characterized so far in sea urchins. Four classes of histones in sea urchins have been characterized. Three sets of histone variants are coexisting in the embryo at larval stages of sea urchin’s development: the maternally inherited cleavage stage variants (CS) expressed during the two initial cleavage divisions, the early histone variants, which are recruited into embryonic chromatin from middle cleavage stages until hatching and the late variants, that are fundamentally expressed from blastula stage onward [oliver_conservative_2003]. The fourth class of histones in sea urchins are the sperm histones [mandl_five_1997]. Early, late, and sperm histone genes lack introns, contain the conserved 3-prime terminal stem-loop structure instead of a poly(A) addition site, and thus show the classical hallmarks of replication-dependent histone genes. The repetitive early histone genes are transcriptionally activated upon meiotic maturation of the egg, are maximally expressed in the rapidly dividing blastula embryo, and are already silenced at the hatching blastula stage, when the transcripts of late histone genes start to accumulate [mandl_five_1997].',
'Echinoidea (sea urchins)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('early_H2B_(Echinoidea)',
'variant_group',
'Echinoidea',
'7625',
27,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('early_H2B_(Echinoidea)',
'oliver_conservative_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('early_H2B_(Echinoidea)',
'mandl_five_1997');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(28,
'late_H2B_(Echinoidea) is a histone variant class of late H2B histones characterized so far in sea urchins. Four classes of histones in sea urchins have been characterized. Three sets of histone variants are coexisting in the embryo at larval stages of sea urchin’s development: the maternally inherited cleavage stage variants (CS) expressed during the two initial cleavage divisions, the early histone variants, which are recruited into embryonic chromatin from middle cleavage stages until hatching and the late variants, that are fundamentally expressed from blastula stage onward [oliver_conservative_2003]. The fourth class of histones in sea urchins are the sperm histones [mandl_five_1997]. Early, late, and sperm histone genes lack introns, contain the conserved 3-prime terminal stem-loop structure instead of a poly(A) addition site, and thus show the classical hallmarks of replication-dependent histone genes. The repetitive early histone genes are transcriptionally activated upon meiotic maturation of the egg, are maximally expressed in the rapidly dividing blastula embryo, and are already silenced at the hatching blastula stage, when the transcripts of late histone genes start to accumulate [mandl_five_1997]. Late genes are active from the late blastula stage onward [maxson_evolution_1987].',
'Echinoidea (sea urchins)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('late_H2B_(Echinoidea)',
'variant_group',
'Echinoidea',
'7625',
28,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('late_H2B_(Echinoidea)',
'oliver_conservative_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('late_H2B_(Echinoidea)',
'mandl_five_1997');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('maxson_evolution_1987',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('late_H2B_(Echinoidea)',
'maxson_evolution_1987');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(29,
'sperm_H2B_(Echinoidea) is a histone variant class of sperm H2B histones characterized so far in sea urchins. Four classes of histones in sea urchins have been characterized. Three sets of histone variants are coexisting in the embryo at larval stages of sea urchin’s development: the maternally inherited cleavage stage variants (CS) expressed during the two initial cleavage divisions, the early histone variants, which are recruited into embryonic chromatin from middle cleavage stages until hatching and the late variants, that are fundamentally expressed from blastula stage onward [oliver_conservative_2003]. The fourth class of histones in sea urchins are the sperm histones. They are exclusively transcribed during spermatogenesis and code for specialized H1 and H2B proteins with basic N-terminal extensions which are responsible for the unusually high chromatin condensation in mature sperm [mandl_five_1997]. In parechinus angulosus the characterized sperm H2B sequence has a repeating pentapeptide in the N-terminal region [strickland_complete_1978].',
'Echinoidea (sea urchins)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('sperm_H2B_(Echinoidea)',
'variant_group',
'Echinoidea',
'7625',
29,
'H2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('sperm_H2B_(Echinoidea)',
'oliver_conservative_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('sperm_H2B_(Echinoidea)',
'mandl_five_1997');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('strickland_complete_1978',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('sperm_H2B_(Echinoidea)',
'strickland_complete_1978');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(30,
'cH3  canonical H3 histones. This is a loosely defined group that encompasses major H3 histone proteins that are mainly expressed during S-phase of the cell cycle in eukaryotes and are highly conserved even between distantly related species. Such proteins are often called replication dependent (RD), replication coupled (RC), clustered or "bulk" histones [marzluff_metabolism_2008,talbert_histone_2021]. They are likely similar to the original H3 histones of the last common ancestor of eukaryotes [malik_phylogenomics_2003]. Expression of canonical histones during S-phase is often tightly regulated, but mechanisms may differ among kindoms [marzluff_birth_2017,pontarotti_long-term_2009]. Canonical histone genes are often present as large mulrigene families clustered together in certain locations of the genome. However, there are known limitations to the definition given above. Functional diversification of paralogous genes is a common process in evolution  in some species multiple copies of canonical histone genes have undergone diversification in terms of sequence variation, cell-cycle or tissue-specific expression patterns. Such diversification for cH3s is rather limited compared to cH2As and cH2Bs. In humans there are only two very similar cH3 isoforms both expressed in S-phase (cH3.1 and cH3.2). However, the mamal-specific H3.4 variant, which manifests tissue specific expression, is in fact a very closely related to the canonical H3s (similarly to cH2A.1 and cH2B.1 is is located within histone gene clusters and has mRNA with a stem-loop). In plants, some cH3s show variable expression patterns [alvarez-venegas_canonical_2019]. Hence, whether a particular gene should be regarded as a canonical, a bona fide variant or a canonical subvariant/isoform may be a matter of debate and definition in each particular case. Another complication with defining cH3 class is that major H3 variants, such as H3.3, may only have 3-4 amino acid deference with the canonical H3 histone. They may have arisen multiple times during evolution and hence their functional classification does not match the phylogenetic classificstion. Ascomycetes are thought to have lost cH3 genes and generally have only a single form which is H3.3-like, it is usually referred to simply as H3 [talbert_unified_2012, malik_phylogenomics_2003]. Within the current hierarchical classification system, additional information about the cH3 class may be gained by looking at the description of its subclasses. ',
'Eukaryotes, although lost in ascomycetes.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3',
'variant_group',
'Eukaryota',
'2759',
30,
'H3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('talbert_unified_2012',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
'talbert_unified_2012');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' malik_phylogenomics_2003',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3',
' malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(30,
'canonical H3',
null,
null,
null,
'cH3');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(31,
'RC H3',
null,
null,
null,
'cH3');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(32,
'RD H3',
null,
null,
null,
'cH3');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(31,
'H3.3  is a diverse functional class comprising replication-independent (also called replacement) variants of the H3 histone. It seems that a distinction between H3 and H3.3 types has arisen numerous times in evolution. Four such instances are at least evident in ciliates, apicomplexans, animals and plants [malik_phylogenomics_2003]. H3.3 are characterized by changes at four positions with respect to cH3s, one in the N-terminal tail and three in the alpha-2-helix of the histone fold domain. Strictly speaking, this is not convergent evolution because the H3.3 versions do not all have the same amino acid residues in these four positions. However, it strongly suggests that a similar constraint has led to these repeated origins of distinguishable H3 and H3.3 types [malik_phylogenomics_2003]. Although, given the likelihood of independent divergences, H3.3 variants from different taxonomic clades may be neither more nor less orthologous to animal H3.3 than their cH3 ounterparts [talbert_unified_2012]. Replication-independent and replication-coupled H3 variants within an organism typically differ in residue 31 (and whether it can be phosphorylated) as well as residues 86?? and 89, but distinguishing residues vary in different organisms and caution is advised in designating H3.3 in less wellstudied eukaryotic kingdoms [talbert_unified_2012].',
'Eukaryotes',
null,
'According to Malik et al. no eukaryotic genome that has been characterized with only canonical H3 and not H3.3. Although there is little doubt regarding multiple origins of H3.3, it is certainly conceivable that ancestrally, an H3.3 was present in a small, predominantly transcriptionally active genome. The rapid expansion of eukaryotic genomes, large portions of which became silent in differentiated cells, may have selected for H3 and its expansion, both for increasing bulk packaging duties and to ensure transcriptional silencing where appropriate. In this regard, it is important to note that even in the archaeon M. fervidus, this division of labor is evident between HMfA and HMfB5 [malik_phylogenomics_2003].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3',
'variant_group',
'Eukaryotes',
'2759',
31,
'H3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3',
'talbert_unified_2012');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(32,
'H3.4_(Mammalia)  is a mammal-specific H3 histone variant highly expressed in testis and at lower level in other tissues [kycia_tudor_2014]. This variant is also reffered to as H3.1t, H3T, or TS H3.4. The H3.4 variant is very similar to canonical H3 histones both in sequence, gene location and transcriptional regulation. In human H3.4 has only 4 amino acid difference from cH3s (A23V,V71M, A98S, A111V), its gene is located within histone gene cluster, is intronless, its mRNA has a stem-loop structure. H3.4 expression is  replication-dependent [ueda_testis-specific_2017]. Mouse H3.4 was shown to be essential for very early stages of spermatogenesis, its deficiency leads to azoospermia because of the loss of haploid germ cells. When differentiating spermatogonia emerge in normal spermatogenesis, H3.4 appears and replaces the canonical H3 proteins [ueda_testis-specific_2017]. Structural studies have revealed that H3.4 containing nucleosome are less stable, particularly due to V71M and A111V substitutions [tachiwana_structural_2010]. Tachiwana et al. have found that H3.4/H4 is not efficiently incorporated into the nucleosome by human Nap1 chaperone, due to its defective H3.4/H4 deposition on DNA. In contrast, human Nap2 chaperone, a paralog of Nap1, promoted nucleosome assembly with H3.4/H4. Mutational analyses revealed that the A111V mutation in H3.4 is essential for this difference [tachiwana_nucleosome_2008]. It was demostrated that A23V mutation favors the interaction of trymethyllysine-binding Tudor domains of PHF1 and PHF2 proteins (critical components of the PCR2 complex) with H3K27me3 marks. PHF1 co-localizes with H3.4 in testis and its Tudor domain preferentially binds to H3.4K27me3 over canonical H3K27me3 in vitro, implicating that H3.4K27me3 might be a physiological ligand of PHF1/19. [dong_structural_2020, kycia_tudor_2014].',
'Mammals',
'In human is encoded by H3-4 gene (formerly HIST3H3, also an alias name H3C16 has been suggested (Seal et al.)), in mouse by H3f4 gene. The gene encodes mRNA with a stem loop structure. In human the gene is located on chromosome 1 adjacent to genes H2AC25 and H2BC26 in a small histone gene cluster.',
null,
null,
null,
null,
null,
null,
null,
'PDB structure of human H3.4 containing nucleosome is available with id 3A6N [tachiwana_structural_2010].',
null,
'The single‑nucleotide polymorphism c190C>T (Arg64Cys) in the human testis‑specific histone variant, H3.4, was studied in Japanese patients for its association with Sertoli cell‑only syndrome, which causes infertility [dong_structural_2020].',
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.4_(Mammalia)',
'variant_group',
'Mammalia',
'40674',
32,
'H3');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('kycia_tudor_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
'kycia_tudor_2014');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('ueda_testis-specific_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
'ueda_testis-specific_2017');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('tachiwana_structural_2010',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
'tachiwana_structural_2010');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('tachiwana_nucleosome_2008',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
'tachiwana_nucleosome_2008');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('dong_structural_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
'dong_structural_2020');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' kycia_tudor_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.4_(Mammalia)',
' kycia_tudor_2014');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(33,
'H3T',
null,
null,
null,
'H3.4_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3-like?',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.1-like_(Plants)',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.5_(Primates_or_Hominids?)',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.6_(Mammals?)?',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.7_(Mammals?)?',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.8_(Mammals?)?',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.P_(Moneuplotes?)',
'variant_group',
'Moneuplotes',
'152459',
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.V_(Trypanosomes?)',
'variant_group',
'Trypanosomes',
'93954',
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.B_(Giardia?)',
'variant_group',
'Giardia',
'5740',
null,
'H3');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cenH3_(Eukarya)',
'variant_group',
null,
null,
null,
'H3');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(33,
'Canonical histones are replication-dependent while histone variants are replication-independent, constitutively expressed during cell cycle. Genes encoding canonical histones are typically located within multigene clusters and use specific type of regulation at the RNA level with a stem loop structure instead of polyA tail',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH4',
'variant_group',
'Eukaryotes',
'2759',
33,
'H4');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH4',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(34,
'ca H4',
null,
null,
null,
'cH4');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH1',
'variant_group',
null,
null,
null,
'H1');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(34,
'H1 has mainly species specific variants. In current version of HistoneDB all H1 are presented as genericH1 class, except for several interesting species specific variants which are provided as separate classes.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('generic_H1',
'variant_group',
'Eukaryotes',
'2759',
34,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('generic_H1',
'22650316');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('23945933',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('generic_H1',
'23945933');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('10973918',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('generic_H1',
'10973918');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('11149891',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('generic_H1',
'11149891');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('26212454',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('generic_H1',
'26212454');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(35,
'gen H1',
null,
null,
null,
'generic_H1');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(35,
'H1.0 is a replication independent linker histone found in animals expressed in terminally differentiated cells. Has a common monophyletic origin that can be traced back before the differentiation between protostomes and deuterostomes, very early in metazoan evolution.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.0',
'variant_group',
'Metazoa',
'33208',
35,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.0',
'22650316');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.0',
'23945933');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('7066298',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.0',
'7066298');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('2898141',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.0',
'2898141');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(36,
'H1°',
null,
null,
null,
'H1.0');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(37,
'H5',
'aves',
null,
null,
'H1.0');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(38,
'H1δ',
null,
null,
null,
'H1.0');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(39,
'RI H1',
null,
null,
null,
'H1.0');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(36,
'H1.1 is a replication independent linker histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.1',
'variant_group',
'Homo',
'9605',
36,
'H1');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('26689747',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.1',
'26689747');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(37,
'H1.2 is a replication independent linker histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.2',
'variant_group',
'Homo',
'9605',
37,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.2',
'26689747');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(38,
'H1.3 is a replication independent linker histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.3',
'variant_group',
'Homo',
'9605',
38,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.3',
'26689747');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(39,
'H1.4 is a replication independent linker histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.4',
'variant_group',
'Homo',
'9605',
39,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.4',
'26689747');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(40,
'H1.5 is a replication independent linker histone.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.5',
'variant_group',
'Homo',
'9605',
40,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.5',
'26689747');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(41,
'Sequences collected here belong to (TS) H1.6 - a testis specific variant of H1 common in mammals.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('TS_H1.6',
'variant_group',
'Mammalia',
'40674',
41,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('TS_H1.6',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(40,
'H1t',
null,
null,
null,
'TS_H1.6');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(42,
'Sequences collected here belong to (TS) H1.7 - a testis specific variant of H1 common in mammals.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('TS_H1.7',
'variant_group',
'Mammalia',
'40674',
42,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('TS_H1.7',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(41,
'H1T2',
null,
null,
null,
'TS_H1.7');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(43,
'Sequences collected here belong to (OO) H1.8 - an oocyte specific variant of H1 common in mammals.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('OO_H1.8',
'variant_group',
'Mammalia',
'40674',
43,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('OO_H1.8',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(42,
'H1oo',
null,
null,
null,
'OO_H1.8');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(44,
'Sequences collected here belong to (TS) H1.9 - a testis specific variant of H1 common in mammals.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('TS_H1.9',
'variant_group',
'Mammalia',
'40674',
44,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('TS_H1.9',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(43,
'Hils1',
null,
null,
null,
'TS_H1.9');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(45,
'Sequences collected here belong to H1.10 here - a vertebrate specific H1 variant.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H1.10',
'variant_group',
'Vertebrates',
'7742',
45,
'H1');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H1.10',
'22650316');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(44,
'H1x',
null,
null,
null,
'H1.10');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(46,
'A special variant of H1 found in Saccharomyces and probably other yeast species that has two globular domains. Saccharomyces cerevisiae has only one gene that encodes H1 histone (HHO1).',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('scH1',
'variant_group',
'Saccharomyces(?)',
'4930',
46,
'H1');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('8772381',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('scH1',
'8772381');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(47,
'cH2A_(Animals)  clustered H2A histones in animals (Metazoa), often called canonical, replication-dependent, replication-coupled or "bulk" H2A histones are a major class of H2A histones in animals with high sequence similarity across all animal species. Histone genes encodig these proteins have several particular features. 1) These genes lack introns and are found in multiple similar copies clustered along the genome togerther with other core histone genes (H3, H4, H2B, and optionally H1). The exact organisation may vary from tandemly repeated quintets of H3, H4, H2A, H2B, H1 genes transcribed from the same strand to  non-tandem jumbled arrays of genes transcribed from divergent promoters [pontarotti_long-term_2009]. 2) These genes are mainly expressed during S-phase of the cell cycle in a coordinated fashion (hence the name "replication dendent") and produce mRNAs that are not polyadenylated but rather end in a conserved stem-loop, which is further bound by the stem-loop binding protein (SLBP). mRNAs are rapidly degraded after the S-phase. 3) These genes are present in a specialized nuclear domain, the histone locus body (HLB), which concetrates factors for histone mRNA transcription and processing (in humans these include NPAT, U7 snRNP, FLASH) [marzluff_birth_2017].',
'Animals (Metazoa)',
null,
'H2A.X histone variant is usually closely related to replication-dependent H2A histones in the same group of animals. In humans, H2A.X produces both polyadenylated mRNAs and mRNAs ending in a stem-loop. It is probale that it is ancestral to clustered H2A histones [talbert_histone_2021].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
'1) Clustered histones may still exhibit some level of sequence variation between the multiple gene copies in certain species. Evidence exists that these differences may have functional implications (e.g. affect nucleosome stability). Some clustered genes have tissue-specific expression and play specific functional roles (e.g. cH2A.1 in mice). 2) A subset of clustered histones, which are normally expressed as replication-dependent histones, are expressed as polyadenylated mRNAs in adult non-dividing tissues to replenish histone pool in differentiated tissues [lyons_subset_2016]. 3) Certain clustered histones may act as functional histone variants with replication-independent polyA-tail-regulated expression being the major/only form (e.g. cH2B.E_(Mus_musculus), or H2A.J, which is closely related to cH2As). 4) In C. elegans an alternative mechanism of mRNA 3''-end processing evolved resulting in loss of HLB and histone clusters [marzluff_birth_2017, pontarotti_long-term_2009]. 5) H2A.X histone variant is usually closely related to replication-dependent H2A histones in the same group of animals. In humans, H2A.X produces both polyadenylated mRNAs and mRNAs ending in a stem-loop. It is probale that it is ancestral to clustered H2A histones [talbert_histone_2021]. ');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Animals)',
'variant',
'Metazoa',
'33208',
47,
'cH2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Animals)',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Animals)',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(48,
'cH2A_(Plants)  canonical H2A histones of green plants (Viridiplantae), which include green algae and land plants. This is a loosely defined group of replication-dependent H2A histones in plants together with similar sequences that might have further diversified towards replication-independent tissue-specific expression but have not yet been extensively studied. Currenly not much is known about the functional specialization of various cH2As isoforms in plants [alvarez-venegas_canonical_2019]. Organisation of canonical histones in green plants is variable. In land plants unlike clustered/canonical histones of animals (see cH2A_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome, H2A genes may have introns. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]',
'Viridiplantae (Plants)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Plants)',
'variant',
'Viridiplantae',
'33090',
48,
'cH2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Plants)',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Plants)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' alvarez-venegas_canonical_2019',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Plants)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(49,
'cH2A_(Fungi)  canonical replication-dependent H2A histones in fungi. In most fungal species H2A.X histone plays the role of the primary H2A histone [nowrousian_5_2014]. In the current classification these histones will be classified as H2A.X, and this group does not include them. Certain parasitic fungi have been reported to lack H2A.X and have H2A histones [dalmasso_canonical_2011]. Note: Since H2A.X are usually closely related to canonical H2As within respective taxanomic groups, an alternative approach might be to assign fungal H2A.X histones simultaneously to both H2A.X and cH2A classes.',
'Fungi',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Fungi)',
'variant',
'Fungi',
'4751',
49,
'cH2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('nowrousian_5_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Fungi)',
'nowrousian_5_2014');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Fungi)',
'dalmasso_canonical_2011');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(50,
'cH2A_(Protists)  canonical replication-dependent H2A histones in various protists.',
'Protists',
null,
null,
'Recent evidence suggests that the specialized stem-loop forming 3-prime-end of replication-dependent histone mRNAs originated early in the evolution of eukaryotes but was completely lost in several lineages, including plants, fungi and most protozoa. Instead, these species synthesize histones from cell-cycle-regulated polyadenylated mRNAs, and regulation is primarily at the level of transcription [marzluff_metabolism_2008].',
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Protists)',
'variant',
'',
'',
50,
'cH2A');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(51,
'H2A.Z.1_(Chordata)  product of one of two H2A.Z genes converved in chordates, homologous to human H2AZ1 gene [giaimo_histone_2019]. Porducts of H2AZ1 and H2AZ2 genes differ by only three amino acids, however they have acquired some degree of functional indepedence. For example, H2A.Z.1 has been shown to better interact with bromodomain-containing protein 2 (BRD2) [draker_combination_2012], H2A.Z.2  preferentially associates with H3 trimethylated at lysine 4  (H3K4me3) [dryhurst_characterization_2009].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.1_(Chordata)',
'variant',
'Chordata',
'7711',
51,
'H2A.Z');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Chordata)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Chordata)',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Chordata)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('draker_combination_2012',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Chordata)',
'draker_combination_2012');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('dryhurst_characterization_2009',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Chordata)',
'dryhurst_characterization_2009');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(52,
'H2A.Z.2_(Chordata)  product of one of two H2A.Z genes converved in chordates, homologous to human H2A.Z.2 gene [giaimo_histone_2019]. Porducts of H2A.Z.1 and H2A.Z.2 genes differ by only three amino acids, however they have acquired some degree of functional indepedence. For example, H2A.Z.1 has been shown to better interact with bromodomain-containing protein 2 (BRD2) [draker_combination_2012], H2A.Z.2  preferentially associates with H3 trimethylated at lysine 4  (H3K4me3) [dryhurst_characterization_2009].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2_(Chordata)',
'variant',
'Chordata',
'7711',
52,
'H2A.Z');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Chordata)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Chordata)',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Chordata)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Chordata)',
'draker_combination_2012');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Chordata)',
'dryhurst_characterization_2009');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Animals)',
'variant',
null,
null,
null,
'H2A.X');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Plants)',
'variant',
null,
null,
null,
'H2A.X');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Fungi)',
'variant',
null,
null,
null,
'H2A.X');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Protists)',
'variant',
null,
null,
null,
'H2A.X');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(53,
'macroH2A.1_(Mammalia) is a protein encoded by one of the macroH2A genes in mammals (coresponds to macroH2A.1 gene in humans). This gene further produces two splice variants macroH2A.1.s1 and macroH2A.1.s2 by inclusion of mutually exclusive exons encoding a region within the macro domain. The macro domain of macroH2A.1.s1 isoform is capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose, while other isoforms (including those produced by macroH2A.2 gene homologs) do not have this ability [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.1_(Mammalia)',
'variant',
'Mammalia',
'40674',
53,
'macroH2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.1_(Mammalia)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(54,
'macroH2A.2_(Mammalia) is a protein encoded by one of the macroH2A genes in mammals (coresponds to macroH2A.2 gene in humans). The macro domain of macroH2A.2 variant is not capable of binding NAD+ derived metabolites [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.2_(Mammalia)',
'variant',
'Mammalia',
'40674',
54,
'macroH2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.2_(Mammalia)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(55,
'H2A.B, previously known as "Barr body deficient" (H2A.Bbd) variant  is a short replication independent H2A variant found in eutherian mammals implicated in spermiogenesis, transcription regulation, splicing, DNA synthesis. Genes: Common ancestor of eutherian mammals encoded two or three H2A.B genes. Genes are usually located on X chromosome in three conserved locations (except in mouse, where H2A.B genes are located at other locations on X chromosome with unclear kinship to the ancestral genes that relocated to autosomes and decayed [molaro_evolutionary_2018]). Human and mouse have three genes encoding H2A.Bs [molaro_evolutionary_2018]. Evolution: H2A.B is a rapildy evolving variant which is closely related to H2A.L, H2A.P, H2A.Q. It was suggested that H2A.B have been the subject to diversifying selection in simian primates, although mucj of the increased divergence of short histone H2A variants may be better explained by relaxed purifying selection [molaro_evolutionary_2018]. Knock-out: H2A.B knock-out mice are viable, subfertile and display changes in splicing events [anuar_gene_2019]. Sequence: Around 50% identity with the canonical H2A, has truncated docking domain, divergent histone fold domain, altered acidic patch, arginine rich N-terminus [molaro_evolutionary_2018]. Localization: H2A.B is expressed during mammalian male germ cell development and in the brain [molaro_evolutionary_2018,jiang_short_2020]. Originally, H2A.B  was characterized by its exclusion from the inactive X chromosome if overexpressed in female somatic cells [chadwick_novel_2001]. However, experiments in mouse testis revealed that H2A.B is in fact present on the inactive X chromosome  [soboleva_unique_2011]. Short H2A variants localize to sites of open chromatin and potentiate DNA synthesis, transcription, and splicing [molaro_evolutionary_2018]. This histone variant can bind to RNA directly in vitro and in vivo, and associates with mRNA at intron—exon boundaries [soboleva_new_2017]. Structural effects: H2A.B containing nucleosomes wrap less DNA (~120-130 bp instead of ~150 bp) [sugiyama_distinct_2014,doyen_dissection_2006], form loosely packed chromatin. Interactions: RNA processing factors, proteins involved in the piRNA pathway [jiang_short_2020]  Deposition: It was suggested that H2A.B is incorporated into DNA sites that are transiently exposed, for instance, during DNA replication [jiang_short_2020]. H2A.B-H2A dimers in nucleosomes can spontaneously be replaced by H2A-H2B dimers [hirano_histone_2021]. Disease: H2A.B is upregulated in cancer as other short H2A variants [chew_short_2021]. Caveats: Due to rapid evolution H2A.B function in different species may vary. For example, human H2A.B is retained during spermiogenesis, while is mouse it disappears and H2A.L is retained instead [molaro_evolutionary_2018]. Mouse H2A.B has additional negative residue in acidic patch, which is thought to increase its propensity to compact nucleosomal arrays relative to human H2A.B.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B',
'variant',
'Eutheria',
'9347',
55,
'short_H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('anuar_gene_2019',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'anuar_gene_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('chadwick_novel_2001',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'chadwick_novel_2001');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('soboleva_unique_2011',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('soboleva_new_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'soboleva_new_2017');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('sugiyama_distinct_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'sugiyama_distinct_2014');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('doyen_dissection_2006',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'doyen_dissection_2006');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('hirano_histone_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'hirano_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B',
'chew_short_2021');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(45,
'H2A.Bbd',
null,
null,
null,
'H2A.B');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(46,
'H2A.Lap1(mouse)',
null,
null,
null,
'H2A.B');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(47,
'H2A.B.3(mouse)',
null,
null,
null,
'H2A.B');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(56,
'H2A.L - is a class of short H2A variants in eutherian mammals implicated in spermatogenesis and replacement of histones with protamines. Genes: Сommon ancestor of eutherian mammals encoded three H2A.L genes. These genes are usually located on X chromosome at three locations (named H2A.L.1, H2A.L.2 and H2A.L.3 by Molaro et al.) [molaro_evolutionary_2018]. Humans have two putative genes (H2AL1Q, H2AL3, located at H2A.L.1 and H2A.L.3 loci, respectively) and H2AL1MP pseudogene (located at H2A.L.2 loci has inactivating mutation in all primates). The H2AL1Q and H2AL3 genes have unusually long extensions at their 3''-ends and have not so far been detected at protein level. Mouse genome has a leneage specific expansion of H2A.L genes, encoding a total of 18 genes (15 genes on X chromosome H2a1a-H2a1o and H2al3; two genes on Y-chromosome H2al2c and H2al2b; one gene on chromosome 2 H2al2a) and two pseudogenes [molaro_evolutionary_2018].  At H2A.L.1 locus mouse has a pseudogene H2al1q-ps. The most studied gene in mice is H2al2a. This gene was first identified in [govin_pericentric_2007] (NCBI protein id NP_080903) and was refered to as H2AL2 or H2A.L.2 histone in the following papers. However, this gene is not located at the H2A.L.2 locus (as defined by Molaro et al.) on X-chromosome, but it is rather located on chromosome 2. A synthenic location of H2A.L.2 locus in mouse is occupied by H2al1m gene [Seal et al. unpublished]. Previous names for mouse H2A.Ls include H2A.Lap2, H2A.Lap3, H2A.Lap4, H2AL1, H2AL2 [soboleva_unique_2011, govin_pericentric_2007]. H2AL1 has been used to reffer to H2al1a gene [govin_pericentric_2007]. Evolution: Molaro et al. found that short H2A variants show greater evolutionary divergence between species than even CENPA, the fastest-evolving histone variant examined to date [molaro_evolutionary_2018]. Evolutionary analysis of purifying selection suggested that H2A.L function may have been lost in Old World monkeys and hominoids but retained in New World monkeys [molaro_evolutionary_2018]. Knock-out: H2A.L.2 knock out mice are infertile because transition proteins can no longer associate with chromatin [barral_histone_2017]. Function: Required for the histone–protamine exchange process [barral_histone_2017]. Sequence: Sequence is divergent from cH2A. Identity with cH2A may be as low as 30%. H2A.L variants have a shortened C-termus, truncated docking domain, altered acidic patch, arginine rich N-terminus. Nucleosomes incorporating H2A.L warp less DNA and from more loosely packed chromatin [molaro_evolutionary_2018].  Localization: Accumulates in spermatid nuclei until the end of spermatogenesis and remains in mature sperm chromatin even after protamine exchange in mouse, eventually disappearing from the paternal pronucleus following fertilization [molaro_evolutionary_2018]. Involved in pericentric chromatin organization in spermatids, is retained after histone-to-protamine replacement [hoghoughi_rna-guided_2020]. H2A.L.2 is maximally expressed at later stages of spermatogenesis (condensing spermatids) when histones are bound by transition proteins and then replaced with protamines Structural effects: Interactions: H2A.L.2 preferentially dimerizes with H2B.1 (TH2B) at least in mice [govin_pericentric_2007]. Intranuclear localization of H2A.L.2 is controlled by its ability to bind RNA via its N-terminus [hoghoughi_rna-guided_2020]. Deposition: Likely mediated by interaction with RNA [hoghoughi_rna-guided_2020]. Disease: no information, since no H2A.L have been so far detect at protein level in humans. Caveats: there is some confusion in literature with respect to numbering H2A.L subvariants, especially in mouse (see caveats in description of mouse H2A.L variants).',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L',
'variant',
'Eutheria',
'9347',
56,
'short_H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'22650316');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'25731851');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('19506029',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'19506029');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('17261847',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'17261847');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('18703863',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'18703863');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('Seal et al. unpublished',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'Seal et al. unpublished');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
(' govin_pericentric_2007',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
' govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('barral_histone_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'barral_histone_2017');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('hoghoughi_rna-guided_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L',
'hoghoughi_rna-guided_2020');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(48,
'H2AL',
null,
null,
null,
'H2A.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(49,
'H2AL1',
null,
'1',
null,
'H2A.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(50,
'H2AL2',
null,
'2',
null,
'H2A.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(51,
'H2A.Lap2',
null,
null,
null,
'H2A.L');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(52,
'H2A.Lap3',
null,
null,
null,
'H2A.L');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(57,
'H2A.P - is a class of testis-specific short H2A variants in eutherian mammals expressed at post-meiotic stages of spermatogensis. It is not well studied. Its expression in mouse has been shown only at mRNA level [el_kennani_ms_histonedb_2017], although evolutionary analysis strongly argues that it is a protein coding gene [molaro_evolutionary_2018]. In human H2A.P gene H2ap was previously named HYPM (Huntingtin-interacting protein M) since in yeast two-hybrid experiments it was shown to interact with huntingtin, which contains an expanded polyglutamine tract in individuals with Huntington''s disease [faber_huntingtin_1998]. Genes: Сommon ancestor of eutherian mammals encoded a single H2A.P gene. These genes are usually located on X chromosome as do other short H2As [molaro_evolutionary_2018]. Humans and mouse have one gene name H2AP and H2ap, respectively. Evolution: Molaro et al. found that short H2A variants show greater evolutionary divergence between species than even CENPA, the fastest-evolving histone variant examined to date. Their results indicate that H2A.P and possible H2A.B have been subject to diversifying selection in simian primates, which could partly ecplame the greater divergence of short H2A histone variants compared to other H2A histones in mammals [molaro_evolutionary_2018]. Knock-out: no studies. Function: no specific studies have been reported, but by its similarity to H2A.L it is likely that it participates in the histone–protamine exchange process. Sequence: Has one of the most divergent sequences from cH2A. Identity with cH2A may be as low as 24%. H2A.P variants have a shortened C-termus, truncated docking domain, altered acidic patch, arginine rich N-terminus. H2A.P have lost two key conserved arginine (R) residues in Loop 1 and 2 that contact the DNA minor-groove and acquired many acidic residues at sites including contacts with DNA and H2B. The last 14 residues in H2A.P are more evolutionary contrained than the rest of the protein, suggesting their potential interaction with non-histone proteins. Localization: H2A.P presence has not been confirmed at protein level. H2A.P mRNA were found to be strongly enriched in round and elongating spermatids [govin_pericentric_2007], expressed in the post-meiotic stages of spermatogenesis [el_kennani_ms_histonedb_2017]. Structural effects: Nucleosomes incorporating H2A.P are predicted to be highly destabilized [molaro_evolutionary_2018]. Interactions: In yeast two-hybrid screens was shown to interact with huntingtin [faber_huntingtin_1998]. Disease: no information. Caveats: H2A.P in mice was previously name H2AL3 [govin_pericentric_2007] and H2A.Lap4 [soboleva_unique_2011].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.P',
'variant',
'Eutheria',
'9347',
57,
'short_H2A');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('9700202',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'9700202');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('el_kennani_ms_histonedb_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'el_kennani_ms_histonedb_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('faber_huntingtin_1998',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'faber_huntingtin_1998');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(58,
'H2A.Q - is a short H2A variant present in many eutherian mammalian genomes at a distinct syntenic location. It is not well studied and has only been identified via bioinformatics approaches [molaro_evolutionary_2018]. Human and mouse does not have functional H2A.Q genes, there is a pseudogene in human, named H2AQ1P, Molaro et al. also lists coordinates for mouse pseudogene (mm10, chrX, 59012618-59012929). No expression of H2A.Q in primates has been also  found and evolutionary analysis cannot confirm the presence of purifying selection for the respective genes. Like other intact short H2A genes, dog and pig H2A.Q genes are transcribed in testes but are undetectable in other tissues examined, including ovary [molaro_evolutionary_2018]. While tails of H2A.B and H2A.L are similar, they differ significantly from H2A.P and H2A.Q , suggesting that short histone H2A variants do not share the same function given the importance of the N-terminal tails in regulating nucleosome function [jiang_short_2020]. H2A.Q histone variants have variable N-terminus, truncated histone fold domain of variable length and altered acidic patch [molaro_evolutionary_2018].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Q',
'variant',
'Eutheria',
'9347',
58,
'short_H2A');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Q',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Q',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.J_(Homo_sapiens)',
'variant',
null,
null,
null,
'H2A.J');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(59,
'cH2B_(Animals)  clustered H2B histones in animals (Metazoa), often called canonical, replication-dependent, replication-coupled or "bulk" H2B histones are a major class of H2B histones in animals with high sequence similarity across all animal species. Histone genes encodig these proteins have several particular features. 1) These genes lack introns and are found in multiple similar copies clustered along the genome togerther with other core histone genes (H3, H4, H2A, and optionally H1). The exact organisation may vary from tandemly repeated quintets of H3, H4, H2A, H2B, H1 genes transcribed from the same strand to  non-tandem jumbled arrays of genes transcribed from divergent promoters [pontarotti_long-term_2009]. 2) These genes are mainly expressed during S-phase of the cell cycle in a coordinated fashion (hence the name "replication dendent") and produce mRNAs that are not polyadenylated but rather end in a conserved stem-loop, which is further bound by the stem-loop binding protein (SLBP). mRNAs are rapidly degraded after the S-phase. 3) These genes are present in a specialized nuclear domain, the histone locus body (HLB), which concetrates factors for histone mRNA transcription and processing (in humans these include NPAT, U7 snRNP, FLASH) [marzluff_birth_2017].',
'Animals (Metazoa)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'1) Clustered histones may still exhibit some level of sequence variation between the multiple gene copies in certain species. Evidence exists that these differences may have functional implications (e.g. affect nucleosome stability). Some clustered genes have tissue-specific expression and play specific functional roles (e.g. cH2B.1 and cH2B.E in mice). 2) A subset of clustered histones, which are normally expressed as replication-dependent histones, are expressed as polyadenylated mRNAs in adult non-dividing tissues to replenish histone pool in differentiated tissues [lyons_subset_2016]. 3) Certain clustered histones may act as functional histone variants with replication-independent polyA-tail-regulated expression being the major/only form (e.g. cH2B.E_(Mus_musculus), or H2A.J, which is closely related to cH2As). 4) In C. elegans an alternative mechanism of mRNA 3''-end processing evolved resulting in loss of HLB and histone clusters [marzluff_birth_2017, pontarotti_long-term_2009]. ');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Animals)',
'variant',
'Metazoa',
'33208',
59,
'cH2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Animals)',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Animals)',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(60,
'cH2B_(Plants)  canonical H2B histones of green plants (Viridiplantae), which include green algae and land plants. Currently, this is a loosely defined group of replication-dependent H2B histones in plants together with similar sequences that might have further diversified towards replication-independent tissue-specific expression but have not yet been extensively studied. An example of the latter would be the HTB3 gene of Arabidopsis which has the hallmarks of a replacement histone variant enriched in mature cells [jiang_evolution_2020]. Organisation of canonical histones in green plants is variable. In land plants unlike clustered/canonical histones of animals (see cH2B_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]. Plant H2Bs vary substantially in the length and sequence of their N-terminal tails [jiang_evolution_2020,bergmuller_characterization_2007]. A study of evolution and functional divergence of H2B histones in plants by Jiang et al. concluded that amongst flowering plants, eudicots had experienced the highest degree of divergence among H2B genes [jiang_evolution_2020]. This divergence appears to have been driven by preferential expression during gametogenesis, including three genes in Arabidopsis (HTB7/8/10 genes) and at least one in tomato. While HTB8 gene in Arabidopsis belongs to a phylogenetically distinct H2B.S variant [jiang_evolution_2020], HTB7 and HTB10 are much more similar in sequence to other H2Bs for now are included as cH2B in our classification [alvarez-venegas_canonical_2019].',
'Viridiplantae (Plants)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Plants)',
'variant',
'Viridiplantae',
'33090',
60,
'cH2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Plants)',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Plants)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Plants)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('bergmuller_characterization_2007',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Plants)',
'bergmuller_characterization_2007');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Plants)',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(61,
'cH2B_(Fungi)  canonical replication-dependent H2B histones in fungi.  In most filamentous fungi, genes for the core histones H3, H2A, and H2B, as well as the linker histone H1, are unique [nowrousian_5_2014]. ',
'Fungi',
null,
null,
'Recent evidence suggests that the specialized stem-loop forming 3-prime-end of replication-dependent histone mRNAs originated early in the evolution of eukaryotes but was completely lost in several lineages, including plants, fungi and most protozoa. Instead, these species synthesize histones from cell-cycle-regulated polyadenylated mRNAs, and regulation is primarily at the level of transcription [marzluff_metabolism_2008].',
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Fungi)',
'variant',
'Fungi',
'4751',
61,
'cH2B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Fungi)',
'nowrousian_5_2014');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(62,
'cH2B_(Protists)  canonical replication-dependent H2B histones in various protists.',
'Protists',
null,
null,
'Recent evidence suggests that the specialized stem-loop forming 3-prime-end of replication-dependent histone mRNAs originated early in the evolution of eukaryotes but was completely lost in several lineages, including plants, fungi and most protozoa. Instead, these species synthesize histones from cell-cycle-regulated polyadenylated mRNAs, and regulation is primarily at the level of transcription [marzluff_metabolism_2008].',
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Protists)',
'variant',
'',
'',
62,
'cH2B');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(63,
'H2B.W_(Homo_sapiens)  is a testis-specific histone variant involved in spermiogenesis. Human has two H2B.W-encoding paralogs which are now named as H2BW1 and H2BW2 genes. See H2B.W description for more information.',
'Mammals',
'Human has two H2B.W-encoding paralogs which are now named as H2BW1 and H2BW2 and two pseudogenes (H2BW3P and H2BW4P) all located on the X chromosome between RAB9B and SLC25A3. The H2BW1 gene contains two introns and is transcribed exclusively in testis, where the spliced polyadenylated mRNA was detected [churikov_novel_2004].',
null,
null,
null,
null,
'',
null,
null,
null,
null,
'Single nucleotide polymorphisms (SNPs) in H2B.W genes may result in male infertility. See meta-analysis of several studies by Teimouri et al. [teimouri_association_2018]. Particularly, there was a significant association between 368A>G transition in H2BW1 and male infertility, resulting in His123Arg substitution.',
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.W_(Homo_sapiens)',
'variant',
'Mammalia',
'40674',
63,
'H2B.W');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W_(Homo_sapiens)',
'11892742');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W_(Homo_sapiens)',
'22156475');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(53,
'H2BFWT',
null,
null,
null,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(54,
'member W',
null,
null,
null,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(55,
'type W-T',
null,
null,
null,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(56,
'H2BL2',
null,
null,
null,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(57,
'spH2B',
null,
null,
null,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(64,
'H2B.K_(Homo_sapiens)  is mainly oocyte specific H2B.K variant in human encoded by H2BK1 gene (formerly H2BE1). See H2B.K description for more information.',
'Human',
'H2BK1 gene',
null,
null,
null,
null,
'',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.K_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
64,
'H2B.K');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(65,
'H2B.N_(Homo_sapiens)  is mainly oocyte specific H2B.K variant in human encoded by H2BN1 gene. See H2B.N description for more information.',
'Human',
null,
null,
null,
null,
null,
'',
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.N_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
65,
'H2B.N');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(66,
'cH3_(Animals)  clustered H3 histones in animals (Metazoa), often called canonical, replication-dependent, replication-coupled or "bulk" H3 histones are a major class of H3 histones in animals with high sequence similarity across all animal species. Histone genes encodig these proteins have several particular features. 1) These genes lack introns and are found in multiple similar copies clustered along the genome togerther with other core histone genes (H4, H3, H2B, and optionally H1). The exact organisation may vary from tandemly repeated quintets of H3, H4, H2A, H2B, H1 genes transcribed from the same strand to  non-tandem jumbled arrays of genes transcribed from divergent promoters [pontarotti_long-term_2009]. 2) These genes are mainly expressed during S-phase of the cell cycle in a coordinated fashion (hence the name "replication dendent") and produce mRNAs that are not polyadenylated but rather end in a conserved stem-loop, which is further bound by the stem-loop binding protein (SLBP). mRNAs are rapidly degraded after the S-phase. 3) These genes are present in a specialized nuclear domain, the histone locus body (HLB), which concetrates factors for histone mRNA transcription and processing (in humans these include NPAT, U7 snRNP, FLASH) [marzluff_birth_2017].',
'Animals (Metazoa)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'1) Clustered histones may still exhibit some level of sequence variation between the multiple gene copies in certain species. Although for cH3 this variation is very limited (only two isoforms in humans: H3.1 and H3.2. 2) In C. elegans an alternative mechanism of mRNA 3''-end processing evolved resulting in loss of HLB and histone clusters [marzluff_birth_2017, pontarotti_long-term_2009].');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Animals)',
'variant',
'Metazoa',
'33208',
66,
'cH3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Animals)',
'pontarotti_long-term_2009');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Animals)',
'marzluff_birth_2017');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(67,
'cH3_(Plants)  canonical H3 histones of green plants (Viridiplantae), which include green algae and land plants. This is a loosely defined group of replication-dependent H3 histones in plants together with similar sequences that might have further diversified towards replication-independent tissue-specific expression but have not yet been extensively studied. Currenly not much is known about the functional specialization of various cH3s isoforms in plants [alvarez-venegas_canonical_2019]. The canonical histone H3 or cH3.1 from higher plants is remarkably similar to that of animals, fungi, and even lower eukaryotes. A sequence comparison indicates that only four amino acid substitutions, F41Y, K53R, A90M, and A96C, differentiate the canonical histone H3 from plants and mammals. Interestingly, the five HTR genes from Arabidopsis encoding histone H3.1 do not contain introns and are expressed in tissues containing highly dividing cells and all but one are expressed during the S-phase of the cell cycle. In a similar way, the seven genes encoding H3.1 from rice also lack introns and several of them are expressed in highly dividing tissues [alvarez-venegas_canonical_2019]. Organisation of canonical histones in green plants is variable. In land plants unlike clustered/canonical histones of animals (see cH3_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]. ',
'Viridiplantae (Plants)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Plants)',
'variant',
'Viridiplantae',
'33090',
67,
'cH3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Plants)',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Plants)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Plants)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(68,
'cH3_(Fungi)  canonical replication-dependent H3 histones in fungi, excluding ascomycetes which have lost this gene class. In Ascomycetes such as Saccharomyces cerevisiae, only H3.3 gene is present. Comparison with the basally branching Basidiomycetes, which have both H3 and H3.3, led Malik et al. to the conclusion that only the H3.3 version has been retained in Ascomycetes, presumably because H3.3 can deposit both during and after replication, whereas H3 cannot [malik_phylogenomics_2003].',
'Fungi',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Fungi)',
'variant',
'Fungi',
'4751',
68,
'cH3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Fungi)',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(69,
'cH3_(Protists)  canonical replication-dependent H3 histones in various protists.',
'Protists',
null,
null,
'Recent evidence suggests that the specialized stem-loop forming 3-prime-end of replication-dependent histone mRNAs originated early in the evolution of eukaryotes but was completely lost in several lineages, including plants, fungi and most protozoa. Instead, these species synthesize histones from cell-cycle-regulated polyadenylated mRNAs, and regulation is primarily at the level of transcription [marzluff_metabolism_2008].',
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Protists)',
'variant',
'SAR,Metamonada,Discoba,Amoebozoa',
'2698737,2611341,2611352,554915',
69,
'cH3');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(70,
'H3.3_(Animals)  is a class of replication-independent (also called replacement) variants of the H3 histone in animals. H3.3 is characterized by changes at four positions with respect to cH3s, one in the N-terminal tail and three in the alpha-2-helix of the histone fold domain (positions 31,86,89,90). The sequence differences within the alpha-2-helix alow H3.3 to interact specifically with its own chaperones (HIRA, ATRX, DAXX). At position 31 H3.3s instead of alanine have serine or threonine which can be phosphorilated. There are multiple studies showing that phosphorylation of this site is functionally important [talbert_unified_2012]. Particularly, H3.3S31ph is associated with H3.3K27 acetylation which helps gene activation and was shown to be essential for gastrulation in Xenopus [sitbon_histone_2020]. The metazoan histone H3.3 has been most closely associated with active transcription, replacing cH3s at active genes and promoters, implicated in diverse biological processes, including development, transcriptional memory and transcriptional reprogramming. However, genetic studies highlighted also its imortance in maintaining heterochromatin at telomeres, centromeres, and pericentromeric regions [jang_histone_2015], as well as revealed essential functions of H3.3 in the germline and early embryonic development [elsaesser_new_2010,yuen_histone_2014,jang_histone_2015].',
'Animals (Metazoa)',
'In human H3.3 is encoded by H3-3A and H3-3B genes (formerly, H3F3A and H3F3B), located in chromosome 1 (1q42.12) and 17 (17q25), respectively. In mouse by H3f3a and H3f3b genes. Genes have introns.',
null,
'H3.3 mRNAs are polyadenilated. Expressed independent of DNA synthesis through the cell cycle.',
null,
'H3.3 has been implicated in a variety of biological processes: it is important for embryonic stem cell differentiation, epigenetic reprogramming following somatic cell nuclear transfer, neuron plasticity, the DNA damage response and centromere maintenance. H3.3 is also essential for germ line development in mammals, where it is required for the remodeling of both maternal and paternal gametes [delaney_differential_2018]. Its role in histone replacement at active genes and promoters is highly conserved and has been proposed to participate in the epigenetic transmission of active chromatin states [szenker_double_2011]. Its accumulation at silent loci in pericentric heterochromatin and telomeres, raising questions concerning the actual function of H3.3',
null,
null,
'In humans and other animals specialized chaperone HIRA places H3.3 at sites of histone turnover where it replaces canonical H3s. Such sites include active genes, promoters, enhancers, transcription termination sites. Chaperones ATRX and DAXX deposit H3.3 in telomeres, imprinted genes and other heterochromatic loci, where it is modified with the trimethlyated lysine 9 heterochromatic mark (denoted H3K9me3) to maintain heterochromatin at these locations [talbert_histone_2021]. While the majority of nucleosomes are replaced by protamines during mammalian spermatogenesis, some H3.3 nucleosomes are retained and may transmit epigenetic information to the zygote [delaney_differential_2018]. In embryonic stem cells for example, HIRA chaperones H3.3 to both active and repressed genes, including also bivalent promoters normally repressed in embryonic stem cells. This highlights a role of HIRA in establishing chromatin landscapes not always related to active chromatin but key to allow proper differentiation [otero_histone_2014].',
null,
null,
'Mutations in histone genes can affect sites of PTMs causing changes in local and global DNA methylation status. These effects are directly linked to neoplastic transformation by altered gene expression. Recurrent H3.3 histone mutations are increasingly identified in several malignancies and developmental disorders in human [kumar_genes_2021]. Well characterized oncomutations in H3.3 genes include K27M, G34W/L in pediatric high-grade gliomas and K36M and G34V/R in bone tumors [xiong_histone_2016]. Competing models have suggested that H3K27M oncohistones sequester or poison  PRC2 complex which deposits H3K27me3 marks. However, Sarthy et al. demonstrated that the K27M epitope only inhibits H3K27 trimethylation on chromatin in vivo, supporting the idea that these oncohistones inhibit chromatin-bound PRC2 complexes. A possible mechanism comes from recent reports [lee_automethylation_2019,wang_regulation_2019] showing that EZH2 (key component of PRC2) methylates  itself, and that this automethylation is required for full catalytic activity. These studies also showed that H3K27M blocks EZH2 automethylation, and might contribute to the dominant effect of H3K27M mutations [sarthy_histone_2020].',
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Animals)',
'variant',
'Metazoa',
'33208',
70,
'H3.3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Animals)',
'talbert_unified_2012');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('sitbon_histone_2020',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Animals)',
'sitbon_histone_2020');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('jang_histone_2015',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Animals)',
'jang_histone_2015');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('elsaesser_new_2010',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Animals)',
'elsaesser_new_2010');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('yuen_histone_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Animals)',
'yuen_histone_2014');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(71,
'H3.3_(Plants)  is a class of replication-independent (also called replacement) variants of the H3 histone in green plants (Viridiplantae), which include green algae and land plants. Despite having the same name as H3.3 of animals, similar functions and key amino acids differences with repective canonical H3s, plant H3.3 has evolved independently. However, this strongly suggests that a similar constraint has led to these repeated origins of distinguishable H3 and H3.3 types [malik_phylogenomics_2003]. H3.3  in plants is characterized by changes at four positions with respect to cH3s, two in the N-terminal tail and two in the alpha-2-helix of the histone fold domain (positions 31, 41, 87, 90, compare with positions 31,87,89,90 in animals). At position 31 H3.3s  in plants instead of alanine usially have threonine which can be phosphorilated [talbert_unified_2012]. H3.3 is likely involved in transcriptional regulation, is enriched in the body of actively transcribed genes, promoters and downstream of transcription termination sites in some genes [alvarez-venegas_canonical_2019]. Certain mechanisms of H3.3 action have been reported. Jacob et al. have shown that SET domain of the histone H3 lysine-27 (H3K27) methyltransferase ATXR5 have a bipartite catalytic domain that specifically reads alanine-31 of H3.1. Thus variation at position 31 between H3.1 and replication-independent H3.3 is responsible for inhibiting the activity of ATXR5 and its paralog, ATXR6 [jacob_selective_2014]. Wollmann et al. proposed that H3.3 prevents recruitment of H1, inhibiting H1’s promotion of chromatin folding that restricts access to DNA methyltransferases responsible for gene body methylation. Thus, gene body methylation is likely shaped by H3.3 dynamics in conjunction with transcriptional activity [wollmann_histone_2017].',
'Green plants (Viridiplantae)',
'In contrast to intronless cH3s, H3.3 in plants have introns. In Arabidopsis H3.3 is represented by HTR4, HTR5, and HTR8 genes [alvarez-venegas_canonical_2019].',
null,
'In Arabidopsis, H3.3 genes do not show replication-dependent expression and are rather expressed throughout the cell cycle. In addition, expression of Arabidopsis genes encoding histone H3.3 occurs not only in young, undifferentiated, but also in mature tissues suggesting that the expression of these genes continues after cell division ceases [alvarez-venegas_canonical_2019].',
null,
null,
'Characteristic changes between cH3 and H3.3 in plants are A31T, F41Y, S87H, and A90L [alvarez-venegas_canonical_2019].',
null,
'Similar to animals, plants have a specialized chaperone HIRA that places H3.3 at sites of histone turnover where it replaces canonical H3s [otero_histone_2014] Such sites include active genes, promoters, enhancers, transcription termination sites. In animals chaperones ATRX and DAXX deposit H3.3 in telomeres, imprinted genes and other heterochromatic loci [talbert_histone_2021]. A DAXX homolog has not been found in plants so far, but there is 1 gene coding for a homolog of ATRX. There are also several genes distantly related to animal DEK, which was shown to have histone chaperone activity. The structural and functional characterization of these chaperones in plants awaits future studies [otero_histone_2014].',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Plants)',
'variant',
'Viridiplantae',
'33090',
71,
'H3.3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Plants)',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Plants)',
'talbert_unified_2012');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Plants)',
'alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('jacob_selective_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Plants)',
'jacob_selective_2014');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('wollmann_histone_2017',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Plants)',
'wollmann_histone_2017');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(72,
'H3.3_(Fungi)  is a class of H3 histone variants in Fungi which share similarity to H3.3 in other kingdoms (characteristic amino acids at the four key positions). It is, however, the main form of histone H3 in Ascomycetes, where canonical H3 was lost during evolution [malik_phylogenomics_2003]. While H3.3 in Ascomycetes is the only form of H3 histone it is mainly reffered to as H3 rather than H3.3. In the current classification we will refer to such histones as H3.3_(Ascomycota) to retain its proper placement within our classification. Basidiomycetes have both canonical H3 and H3.3 histones. Fungi H3.3 along with plant and animal H3.3s have evolved independently, but share similar sequence difference with respective canonical H3s. It is likely that they have evolved under similar contraints. Since H3.3 as a separate variant is available only in Basidiomycetes the H3.3/cH3 functional difference in Fungi remains poorly studied. Anju et al. have charaterized two H3 genes in basidiomycete Ustilago maydis U1 and U2. The U1 gene was shown to posses replication-independent expression and sequence characteristic of H3.3 replacement histones, while U2 gene manifested replication-coupled expression typical for canonical H3 [anju_identification_2011].',
'Fungi',
'In S. cerevisiae H3 histone is encoded by HHT1 and HHT2 genes. U1 gene in Ustilago maydis.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Fungi)',
'variant',
'Fungi',
'4751',
72,
'H3.3');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Fungi)',
'malik_phylogenomics_2003');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('anju_identification_2011',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Fungi)',
'anju_identification_2011');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(73,
'H3.3_(Protists)  is a class of H3.3-like replication-independent (also called replacement) variants of the H3 histone in Protists. hv2 H3 histone variant in Tetrahymena thermophila is among the few from this group that have been characterized [yu_constitutive_1997]. Sequence analysis suggests that other protists such as Porphyra, Thalassiosira, Dictyostelium have H3 histones with characteristic differences at positions 31 and 85-89, which may suggest the presence of H3.3-like histones in their genomes [talbert_unified_2012].',
'Fungi',
'HHT3 Tetrahymena thermophila',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Protists)',
'variant',
'SAR,Metamonada,Discoba,Amoebozoa',
'2698737,2611341,2611352,554915',
73,
'H3.3');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('yu_constitutive_1997',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Protists)',
'yu_constitutive_1997');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.3_(Protists)',
'talbert_unified_2012');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(58,
'hv2',
null,
null,
null,
'H3.3_(Protists)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3-like_(Animals)',
'variant',
null,
null,
null,
'H3.3-like?');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3-like_(Plants)',
'variant',
null,
null,
null,
'H3.3-like?');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(74,
'cH2A_(Vertebrata)  clustered H2A histones in vertebrates, often called canonical, replication-dependent, replication-coupled or "bulk" H2A histones. This is a subclass of cH2A_(Animals) (see it for a detailed description).',
'Vertebrates (Vertebrata)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Vertebrata)',
'variant',
'Vertebrata',
'7742',
74,
'cH2A_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(75,
'cH2A_(Embryophyta)  canonical replication-dependent H2A histones of land plants and similar replication-independent histones. In land plants unlike clustered/canonical histones of animals (see cH2A_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome, H2A genes may have introns. [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]',
'Embryophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Embryophyta)',
'variant',
'Embryophyta',
'3193',
75,
'cH2A_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Embryophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Embryophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(76,
'cH2A_(Chlorophyta)  canonical H2A histones of green algae and similar replication-independent histones. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019].',
'Chlorophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Chlorophyta)',
'variant',
'Chlorophyta',
'3041',
76,
'cH2A_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Chlorophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Chlorophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Chlorophyta)',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(77,
'H2A.Z.1_(Primates)  H2A.Z.1 variant in primates, see H2A.Z.1_(Chordata) variant description.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.1_(Primates)',
'variant',
'Primates',
'9443',
77,
'H2A.Z.1_(Chordata)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Primates)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Primates)',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Primates)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(78,
'H2A.Z.2_(Primates)  H2A.Z.2 variant in primates, see H2A.Z.2_(Chordata) variant description.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2_(Primates)',
'variant',
'Primates',
'9443',
78,
'H2A.Z.2_(Chordata)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Primates)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Primates)',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2_(Primates)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Vertebrata)',
'variant',
null,
null,
null,
'H2A.X_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(79,
'macroH2A.1.s1_(Mammalia) is a splice isoform encoded by one of the macroH2A genes in mammals (coresponds to macroH2A.1 gene in humans). The macro domain of macroH2A.1.s1 isoform is capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose, while other isoforms (including those produced by macroH2A.2 gene homologs) do not have this ability [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.1.s1_(Mammalia)',
'variant',
'Mammalia',
'40674',
79,
'macroH2A.1_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.1.s1_(Mammalia)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(80,
'macroH2A.1.s2_(Mammalia) is a splice isoform encoded by one of the macroH2A genes in mammals (coresponds to macroH2A.1 gene in humans). The macro domain of macroH2A.1.s2 isoform is not capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.1.s2_(Mammalia)',
'variant',
'Mammalia',
'40674',
80,
'macroH2A.1_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.1.s2_(Mammalia)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(81,
'macroH2A.2_(Homo_sapiens) is a protein encoded by macroH2A.2 gene in humans. The macro domain of macroH2A.2 variant is not capable of binding NAD+ derived metabolites [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
81,
'macroH2A.2_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.2_(Homo_sapiens)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(82,
'H2A.B_(Homo_sapiens), previously known as "Barr body deficient" (H2A.Bbd) variant  is a group of short replication independent H2A variants in humans encoded by H2AB1, H2AB2 and H2AB3 genes. They are involved in spermiogenesis, transcription regulation, splicing, DNA synthesis. Genes: In human H2A.B is encoded by H2AB1, H2AB2 and H2AB3 genes. Genes are intronless. H2AB2 and H2AB3 encode identical proteins. H2AB1 protein which differes by ??one?? amino acid. Genes are located on X chromosome. Evolution: H2A.B is a rapildy evolving variant which is closely related to H2A.L, H2A.P, H2A.Q [molaro_evolutionary_2018]. Common ancestor of eutherian mammals encoded two or three H2A.B genes. Knock-out: H2A.B knock-out mice are viable, subfertile and display changes in splicing events [anuar_gene_2019]. Sequence: Around 50% identity with the canonical H2A, has truncated docking domain, divergent histone fold domain, altered acidic patch, arginine rich N-terminus [molaro_evolutionary_2018]. Localization: H2A.B is expressed during mammalian male germ cell development and in the brain [molaro_evolutionary_2018,jiang_short_2020]. Originally, H2A.B  was characterized by its exclusion from the inactive X chromosome if overexpressed in female somatic cells [chadwick_novel_2001]. However, experiments in mouse testis revealed that H2A.B is in fact present on the inactive X chromosome  [soboleva_unique_2011]. Short H2A variants localize to sites of open chromatin and potentiate DNA synthesis, transcription, and splicing [molaro_evolutionary_2018]. In mouse this histone variant was shown to bind to RNA directly in vitro and in vivo, and associate with mRNA at intron—exon boundaries [soboleva_new_2017]. Structural effects: H2A.B containing nucleosomes wrap less DNA (~120-130 bp instead of ~150 bp) [sugiyama_distinct_2014,doyen_dissection_2006], form loosely packed chromatin. Interactions: RNA processing factors, proteins involved in the piRNA pathway [jiang_short_2020]  Deposition: It was suggested that H2A.B is incorporated into DNA sites that are transiently exposed, for instance, during DNA replication [jiang_short_2020]. H2A.B-H2A dimers in nucleosomes can spontaneously be replaced by H2A-H2B dimers [hirano_histone_2021]. Disease: H2A.B is upregulated in cancer as other short H2A variants [chew_short_2021]. Caveats: Due to rapid evolution H2A.B function in different species may vary. For example, human H2A.B is retained during spermiogenesis, while is mouse it disappears and H2A.L is retained instead [molaro_evolutionary_2018]. Mouse H2A.B has additional negative residue in acidic patch, which is thought to increase its propensity to compact nucleosomal arrays relative to human H2A.B.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
82,
'H2A.B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'anuar_gene_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'chadwick_novel_2001');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'soboleva_new_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'sugiyama_distinct_2014');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'doyen_dissection_2006');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'hirano_histone_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Homo_sapiens)',
'chew_short_2021');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(59,
'H2A.Bbd',
null,
null,
null,
'H2A.B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(83,
'H2A.B_(Mus_musculus) is a group of three isoforms of H2A.B variant in mouse encoded by H2ab1, H2ab2 and H2ab3 genes. H2ab1 is the most studied gene and corresponds to H2A.B.3 variant. Evolution: Moreover, the ancestral loci encoding H2A.B genes relocated away from the X Chromosome to autosomes in mouse (Chr 3 and Chr 16) and rat genomes (Chr 20 and Chr 18) as determined by flanking genes, and the encoded H2A.B genes have now been deleted or have decayed beyond recognition. However, the rat-mouse common ancestor acquired an intact H2A.B gene in a new X-linked locus [molaro_evolutionary_2018]. Caveats: Unfortunately there is some confusion with respect to the number suffixes in the literature and between the gene names and variant names. The H2ab1 gene variant was named initially H2A.Lap1 [soboleva_unique_2011], but renamed afterwards to H2A.B.3 [soboleva_new_2017], and this name has been used afterwards [anuar_gene_2019,jiang_short_2020]. Hence we follow the established convention.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
83,
'H2A.B');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Mus_musculus)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Mus_musculus)',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Mus_musculus)',
'soboleva_new_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Mus_musculus)',
'anuar_gene_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B_(Mus_musculus)',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(84,
'H2A.L_(Homo_sapiens) - is a class of putative H2A.L histone variants in human. Humans have two putative genes (H2AL1Q, H2AL3, located at H2A.L.1 and H2A.L.3 loci, respectively) and H2AL1MP pseudogene (located at H2A.L.2 loci has inactivating mutation in all primates). The H2AL1Q and H2AL3 genes have unusually long extensions at their 3''-ends and have not so far been detected at protein level. See H2A.L description for more information.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
84,
'H2A.L');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(85,
'H2A.L_(Mus_musculus) - is a group of H2A.L histone variants in mouse. The single autosomal H2al2a (H2A.L.2 variant) gene in mouse located on chromosome 2 is expressed at much higher levels than the sex-linked copies; knockout of this single gene is sufficient to cause male sterility [molaro_evolutionary_2018]. See H2A.L description for more information. Caveats: there is some confusion with the variant names in the literature. Govin et al. initially identified and named three variants H2AL1, H2AL2, H2AL3 [govin_pericentric_2007]. These are encoded by H2al1a, H2al2a and H2ap genes, respectively. The H2Al2 endoded variant was later renamed in the literature as H2A.L.2 [jiang_short_2020]. The H2ap gencoded variant is in fact H2A.P in the current nomenclature. Alternatively, Molaro et al. have named three evolutionary conserved loci on X chromosome that harbor H2A.L genes, these loci are H2A.L.1, H2A.L.2 and H2A.L.3 [molaro_evolutionary_2018]. While human gene and variant naming is in line with the names of these loci, in mouse names of these loci do not correspond exactly to the originally proposed gene names except for H2A.L.3 locus which harbors H2al3 gene (not H2ap gene(!)). In mouse at H2A.L.1 locus a pseudogene H2al1q-ps is located, at H2A.L.2 locus mouse has H2al1m gene (H2al1a-H2al1o genes located within 5 megabases from this locus have similar protein sequences(?)), while H2A.L.2 variant encoded by H2al2a is located on chromosome 2 (two similar genes H2al2b and H2al2c are located on Y chromosome). In this classification we follow the numbering used in gene names which also corresponds to the one established earlier in the literature. Hence, H2A.L.2 variant in mouse encompasses H2al2a gene and similar H2al2b and H2al2c genes, while H2A.L.1 variant encompasses 14 H2al1a-H2al1o genes including H2al1m gene located at a syntenic location of the H2A.L.2 locus',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
85,
'H2A.L');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L_(Mus_musculus)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L_(Mus_musculus)',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L_(Mus_musculus)',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(86,
'H2A.P_(Homo_sapiens) - is a H2A.P variant histone encoded in humans by H2AP gene. See H2A.P variant description for more information. In human H2A.P gene H2ap was previously named HYPM (Huntingtin-interacting protein M) since in yeast two-hybrid experiments it was shown to interact with huntingtin, which contains an expanded polyglutamine tract in individuals with Huntington''s disease [faber_huntingtin_1998].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.P_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
86,
'H2A.P');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P_(Homo_sapiens)',
'9700202');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P_(Homo_sapiens)',
'faber_huntingtin_1998');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(87,
'H2A.P_(Mus_musculus) - is a H2A.P variant histone encoded in humans by H2ap gene. See H2A.P variant description for more information. Caveats: H2A.P in mice was previously name H2AL3 [govin_pericentric_2007] and H2A.Lap4 [soboleva_unique_2011].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.P_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
87,
'H2A.P');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P_(Mus_musculus)',
'govin_pericentric_2007');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.P_(Mus_musculus)',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(88,
'cH2B_(Vertebrata)  clustered H2B histones in vertebrates, often called canonical, replication-dependent, replication-coupled or "bulk" H2B histones. This is a subclass of cH2B_(Animals) (see it for a detailed description).',
'Vertebrates (Vertebrata)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Vertebrata)',
'variant',
'Vertebrata',
'7742',
88,
'cH2B_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(89,
'cH2B_(Embryophyta)  canonical H2B histones of land plants. In land plants unlike clustered/canonical histones of animals (see cH2A_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]. See description of cH2B_(Plants) variant Jiang et al. paper for further information about H2B histones in plant [jiang_evolution_2020].',
'Embryophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Embryophyta)',
'variant',
'Embryophyta',
'3193',
89,
'cH2B_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Embryophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Embryophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Embryophyta)',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(90,
'cH2B_(Chlorophyta)  canonical H2B histones of green algae and similar replication-independent histones. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]. See description of cH2B_(Plants) variant Jiang et al. paper for further information about H2B histones in plant [jiang_evolution_2020].',
'Chlorophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Chlorophyta)',
'variant',
'Chlorophyta',
'3041',
90,
'cH2B_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Chlorophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Chlorophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Chlorophyta)',
'jiang_evolution_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(91,
'H2B.W.1_(Homo_sapiens)  is a testis-specific histone variant involved in spermiogenesis encoded by H2BW1 gene (formerly H2BFWT). See H2B.W description for more information.',
'Mammals',
'Human has two H2B.W-encoding paralogs which are now named as H2BW1 and H2BW2 and two pseudogenes (H2BW3P and H2BW4P) all located on the X chromosome between RAB9B and SLC25A3. The H2BW1 gene contains two introns and is transcribed exclusively in testis, where the spliced polyadenylated mRNA was detected [churikov_novel_2004].',
null,
null,
null,
null,
'',
null,
null,
null,
null,
'Single nucleotide polymorphisms (SNPs) in this gene may result in male infertility. See meta-analysis of several studies by Teimouri et al. [teimouri_association_2018]. Particularly, there was a significant association between 368A>G transition in H2BW1 and male infertility, resulting in His123Arg substitution.',
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.W.1_(Homo_sapiens)',
'variant',
'Mammalia',
'40674',
91,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W.1_(Homo_sapiens)',
'11892742');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W.1_(Homo_sapiens)',
'22156475');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(60,
'H2BFWT',
null,
null,
null,
'H2B.W.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(61,
'member W',
null,
null,
null,
'H2B.W.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(62,
'type W-T',
null,
null,
null,
'H2B.W.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(63,
'H2BL2',
null,
null,
null,
'H2B.W.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(64,
'spH2B',
null,
null,
null,
'H2B.W.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(92,
'H2B.W.2_(Homo_sapiens)  is a testis-specific histone variant involved in spermiogenesis encoded by H2BW2 gene (formerly H2BFM). Currenly, it is not well characterized. See H2B.W description for more information.',
'Mammals',
'Human has two H2B.W-encoding paralogs which are now named as H2BW1 and H2BW2 and two pseudogenes (H2BW3P and H2BW4P) all located on the X chromosome between RAB9B and SLC25A3. The H2BW2 gene is locate on X-chromosome.',
null,
null,
null,
null,
'',
null,
null,
null,
null,
'Single nucleotide polymorphisms (SNPs) in this gene may result in male infertility. See meta-analysis of several studies by Teimouri et al. [teimouri_association_2018]. Particularly, there was a significant association between 368A>G transition in H2BW1 and male infertility, resulting in His123Arg substitution.',
'H2B.M name has been used in literature to refer to this variant [raman_novel_2022].');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2B.W.2_(Homo_sapiens)',
'variant',
'Mammalia',
'40674',
92,
'H2B.W_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W.2_(Homo_sapiens)',
'11892742');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2B.W.2_(Homo_sapiens)',
'22156475');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(65,
'H2BFM',
null,
null,
null,
'H2B.W.2_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(93,
'cH3_(Vertebrata)  clustered H3 histones in vertebrates, often called canonical, replication-dependent, replication-coupled or "bulk" H3 histones. This is a subclass of cH3_(Animals) (see it for a detailed description).',
'Vertebrates (Vertebrata)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Vertebrata)',
'variant',
'Vertebrata',
'7742',
93,
'cH3_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(94,
'cH3_(Embryophyta)  canonical replication-dependent H3 histones of land plants and similar replication-independent histones. In land plants unlike clustered/canonical histones of animals (see cH3_(Metazoa)) replication dependent histone mRNAs are polyadenilated and genes are interspersed throught the genome. [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]',
'Embryophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Embryophyta)',
'variant',
'Embryophyta',
'3193',
94,
'cH3_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Embryophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Embryophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(95,
'cH3_(Chlorophyta)  canonical replication-dependent H3 histones of green algae and similar replication-independent histones. In chlorophyte green algae, such as Chlamydomonas, genes are grouped in clusteres and mRNAs end in 3''-stem loop similar to those of histone genes in animals [marzluff_metabolism_2008, alvarez-venegas_canonical_2019]',
'Chlorophyta',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Chlorophyta)',
'variant',
'Chlorophyta',
'3041',
95,
'cH3_(Plants)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Chlorophyta)',
'marzluff_metabolism_2008');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Chlorophyta)',
' alvarez-venegas_canonical_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(96,
'H3.3_(Homo_sapiens)  is a class of replication-independent (also called replacement) variants of the H3 histone in human encoded by H3-3A and H3-3B genes. Both genes code for an identical protein. See H3.3_(Animals) for details description of this variant.',
'Homo sapiens',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
96,
'H3.3_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(97,
'H3.3_(Ascomycota)  is the main form of  H3 histone in Ascomycetes.',
'Fungi',
'In S. cerevisiae H3 histone is encoded by HHT1 and HHT2 genes',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.3_(Ascomycota)',
'variant',
'Ascomycota',
'4890',
97,
'H3.3_(Fungi)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.X_(Primates?)',
'variant',
null,
null,
null,
'H3.3-like_(Animals)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(98,
'H3.Y is involved in memory formation due to its presence in neurons in human hippocampus. One splice isoform has an extended C-terminal alpha tail that may interacts with the H2A.Z acidic patch',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.Y_(Primates?)',
'variant',
'Primates',
'9443',
98,
'H3.3-like_(Animals)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.Y_(Primates?)',
'22650316');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('20819935',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H3.Y_(Primates?)',
'20819935');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(66,
'H3.X',
null,
'2',
null,
'H3.Y_(Primates?)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('TS H3.10',
'variant',
null,
null,
null,
'H3.3-like_(Plants)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3_(Lilly???)',
'variant',
null,
null,
null,
'H3.3-like_(Plants)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(99,
'cH2A_(Mammalia)  clustered H2A histones in mammals, often called canonical, replication-dependent, replication-coupled or "bulk" H2A histones. This is a subclass of cH2A_(Vertebrata) and cH2A_(Animals) (see it for a detailed description).',
'Vertebrates (Vertebrata)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Mammalia)',
'variant',
'Mammalia',
'40674',
99,
'cH2A_(Vertebrata)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(100,
'H2A.Z.1_(Homo_sapiens)  H2A.Z variant encoded in humans by H2A.Z.1 gene. Differes by only 3 amino acids from the product of H2A.Z.2 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.1_(Homo_sapiens)',
'variant',
'Eukaryotes',
'2759',
100,
'H2A.Z.1_(Primates)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Homo_sapiens)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Homo_sapiens)',
'colino-sanguino_h2az-nuclesome_2021');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.1_(Homo_sapiens)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(101,
'H2A.Z.2.s1_(Primates)  this is the main full length splice isoform of H2A.Z.2 in primates as compared to an slternatively spliced H2A.Z.2.s2 isofom which has an alternative shorter C-terminus [giaimo_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2.s1_(Primates)',
'variant',
'Primates',
'9443',
101,
'H2A.Z.2_(Primates)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2.s1_(Primates)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(102,
'H2A.Z.2.s2_(Primates)  this is an alternatively spliced isoform of H2A.Z.2 in primates which has an alternative shorter C-terminus with respect to H2A.Z.2.s1 isoform. This isoform is expressed in a wide range of tissues, including brain tissues. Nucleosome containing H2A.Z.2.s2 isoform are less stable, than nuclesomes with the main isoform. [giaimo_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2.s2_(Primates)',
'variant',
'Primates',
'9443',
102,
'H2A.Z.2_(Primates)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2.s2_(Primates)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Mammalia)',
'variant',
null,
null,
null,
'H2A.X_(Vertebrata)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(103,
'macroH2A.1.s1_(Homo_sapiens) is a splice isoform encoded by macroH2A.1 gene in humans. The macro domain of macroH2A.1.s1 isoform is capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose, while other isoforms (including those produced by macroH2A.2 gene homologs) do not have this ability [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.1.s1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
103,
'macroH2A.1.s1_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.1.s1_(Homo_sapiens)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(104,
'macroH2A.1.s2_(Homo_sapiens) is a splice isoform encoded by macroH2A.1 gene in humans. The macro domain of macroH2A.1.s2 isoform is not capable of binding NAD+ derived metabolites, such as ADP-ribose and poly-ADP-ribose [sun_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('macroH2A.1.s2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
104,
'macroH2A.1.s2_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('macroH2A.1.s2_(Homo_sapiens)',
'sun_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(105,
'H2A.B.1_(Homo_sapiens) is one of the two isoform of H2A.B variant in humans encoded by H2AB1  gene. This isoform differs by ??one?? amino acid from H2A.B.2 isoform encoded by H2AB2 and H2AB3 genes. Caveats: Unfortunately there is confusion with respect to the number suffix in the literature. El Kennani et al. have used this numbering scheme that follows the numbers in the gene names [el_kennani_ms_histonedb_2017]. And the gene names are numbered from centromere to telomere. However, Molaro et al. in their evolutionary analysis have used H2A.B.1.1, H2A.B.1.2 and H2A.B.2 to reffer to H2AB3, H2AB2 and H2AB1 genes, respectively. The variant numbering used by Molaro et al. was based on the relative position of the genes on each arm of the X Chromosome from telomere to centromere [molaro_evolutionary_2018].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B.1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
105,
'H2A.B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Homo_sapiens)',
'el_kennani_ms_histonedb_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Homo_sapiens)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(67,
'H2A.B.2',
null,
null,
null,
'H2A.B.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(106,
'H2A.B.2_(Homo_sapiens) is one of the two isoform of H2A.B variant in humans encoded by H2AB2 and H2AB3  genes. This isoform differs by ??one?? amino acid from H2A.B.1 isoform encoded by H2AB1 gene. Caveats: Unfortunately there is confusion with respect to the number suffix in the literature. El Kennani et al. have used this numbering scheme that follows the numbers in the gene names [el_kennani_ms_histonedb_2017]. And the gene names are numbered from centromere to telomere. However, Molaro et al. in their evolutionary analysis have used H2A.B.1.1, H2A.B.1.2 and H2A.B.2 to reffer to H2AB3, H2AB2 and H2AB1 genes, respectively. The variant numbering used by Molaro et al. was based on the relative position of the genes on each arm of the X Chromosome from telomere to centromere [molaro_evolutionary_2018].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B.2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
106,
'H2A.B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.2_(Homo_sapiens)',
'el_kennani_ms_histonedb_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.2_(Homo_sapiens)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(68,
'H2A.B.1',
null,
null,
null,
'H2A.B.2_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(69,
'H2A.B.1.1',
null,
null,
null,
'H2A.B.2_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(70,
'H2A.B.1.2',
null,
null,
null,
'H2A.B.2_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(107,
'H2A.B.1_(Mus_musculus) is one of the three isoforms of H2A.B variant in mouse encoded by H2ab3 gene. Caveats: Unfortunately there is some confusion with respect to the number suffixes in the literature and between the gene names and variant names. Since a variant encoded by H2ab1 gene was named initially H2A.Lap1 [soboleva_unique_2011], but renamed afterwards to H2A.B.3 [soboleva_new_2017], and this name has been used afterwards [anuar_gene_2019,jiang_short_2020], the H2ab3 gene variant is name here as H2A.B.1.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B.1_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
107,
'H2A.B_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Mus_musculus)',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Mus_musculus)',
'soboleva_new_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Mus_musculus)',
'anuar_gene_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.1_(Mus_musculus)',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(108,
'H2A.B.2_(Mus_musculus) is one of the three isoforms of H2A.B variant in mouse encoded by H2ab2 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B.2_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
108,
'H2A.B_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(109,
'H2A.B.3_(Mus_musculus) is one of the three isoforms of H2A.B variant in mouse encoded by H2ab1 gene. This gene has been characterized the most experimentally among all H2A.B. variants. Caveats: Unfortunately there is some confusion with respect to the number suffixes in the literature and between the gene names and variant names. This variant was named initially H2A.Lap1 [soboleva_unique_2011], but renamed afterwards to H2A.B.3 [soboleva_new_2017], and this name has been used afterwards [anuar_gene_2019,jiang_short_2020]. Hence we follow the established convention. Caveat: Moralo et al. suggests that "rat-mouse common ancestor acquired an intact H2A.B gene in a new X-linked locus (H2a.b.ratMouse1, also historically named H2A.B.3) [molaro_evolutionary_2018]". Our analysis of supplementary information suggests that H2a.b.ratMouse1 is H2ab2 gene in the current nomenclature. Our analysis of sequences published by Soboleva et al. suggests that H2A.B.3 (H2A.Lap1) is H2ab1 gene and not H2ab2 [soboleva_unique_2011].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.B.3_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
109,
'H2A.B_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.3_(Mus_musculus)',
'soboleva_unique_2011');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.3_(Mus_musculus)',
'soboleva_new_2017');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.3_(Mus_musculus)',
'anuar_gene_2019');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.3_(Mus_musculus)',
'jiang_short_2020');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.B.3_(Mus_musculus)',
'molaro_evolutionary_2018');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(71,
'H2A.Lap1',
null,
null,
null,
'H2A.B.3_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(110,
'H2A.L.1_(Homo_sapiens) - is a putative H2A.L histone variant encoded by H2AL1Q gene. It is located at H2A.L.1 locus on X-chromosome which can be traced back to the common ancestor of eutherian mammanls. The H2AL1Q and H2AL3 genes have unusually long extensions at their 3''-ends and have not so far been detected at protein level. See H2A.L description for more information.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L.1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
110,
'H2A.L_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(111,
'H2A.L.3_(Homo_sapiens) - is a putative H2A.L histone variant encoded by H2AL3 gene. It is located at H2A.L.3 locus on X-chromosome which can be traced back to the common ancestor of eutherian mammanls. The H2AL1Q and H2AL3 genes have unusually long extensions at their 3''-ends and have not so far been detected at protein level. See H2A.L description for more information.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L.3_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
111,
'H2A.L_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(112,
'H2A.L.1_(Mus_musculus) - is a group of H2A.L histone variants in mouse endoded by 14 genes on X-chromosome (H2al1a,H2al1b,H2al1c,H2al1d,H2al1e,H2al1f,H2al1g,H2al1h,H2al1i,H2al1j,H2al1k,H2al1m,H2al1n,H2al1o). See H2A.L description for more information. El Kennani et al. reported variations in expression of different H2A.L.1 genes between different stages of spermatogenesis in mice [el_kennani_ms_histonedb_2017].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L.1_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
112,
'H2A.L_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.L.1_(Mus_musculus)',
'el_kennani_ms_histonedb_2017');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(113,
'H2A.L.2_(Mus_musculus) - is a group of H2A.L histone variants in mouse endoded by H2al2a gene on chromosome 2 and two related H2al2b, H2al2b genes on Y-chromosome. H2al2a gene reffered in literature as H2A.L.2 variant is the most studied one, demostrating higher levels of expression than other H2A.L genes in mouse.  See H2A.L description for more information. ',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L.2_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
113,
'H2A.L_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(114,
'H2A.L.3_(Mus_musculus) - is a H2A.L histone variant in mouse endoded by H2al3 gene on X chromosome. Its ortolog at a conserved position in humans is H2AL3 gene. See H2A.L description for more information.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.L.3_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
114,
'H2A.L_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(115,
'cH2B_(Mammalia)  clustered H2B histones in mammals, often called canonical, replication-dependent, replication-coupled or "bulk" H2B histones. This is a subclass of cH2B_(Vertebrata) and cH2B_(Animals) (see it for a detailed description).',
'Mammals (Mammalia)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Mammalia)',
'variant',
'Mammalia',
'40674',
115,
'cH2B_(Vertebrata)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(116,
'cH3_(Mammalia)  clustered H3 histones in mammals, often called canonical, replication-dependent, replication-coupled or "bulk" H3 histones. This is a subclass of cH3_(Vertebrata) and cH3_(Animals) (see it for a detailed description). Mammalian cH3s have the primary cH3.2 isoform and a mammal-specific cH3.1 paralog [talbert_histone_2021].',
'Vertebrates (Vertebrata)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3_(Mammalia)',
'variant',
'Mammalia',
'40674',
116,
'cH3_(Vertebrata)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3_(Mammalia)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.X_(Homo_sapiens)',
'variant',
null,
null,
null,
'H3.X_(Primates?)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H3.Y_(Homo_sapiens)',
'variant',
null,
null,
null,
'H3.Y_(Primates?)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(117,
'cH2A_(Homo_sapiens)  clustered H2A histones in human, often called canonical, replication-dependent, replication-coupled or "bulk" H2A histones. For a general description see cH2A_(Animals) class. Replication-dependent histones in humans are found in four loci: a large cluster on chromosome 6 (more than 60 genes), two clusters on chromosome 1 (10-12 genes and 4 genes) and a single H4 gene on chromosome 12 (with a neighbouring H2AJ gene). Humans have 18 H2A genes that code for replication-dependent H2A histones. The cluster on chromosome 6 encodes 13 H2A genes (H2AC1, H2AC4, H2AC6, H2AC7, H2AC8, H2AC11, H2AC12, H2AC13, H2AC14, H2AC15, H2AC16, H2AC17) and several pseudogenes. The first cluster on chromosome 1 encodes 4 genes (H2AC18, H2AC19, H2AC20, H2AC21), and the second cluster on chromosome 1 endodes one gene (H2AC25). 18 genes enconde 11 protein variants. H2A18, H2AC19, H2AC20, H2AC21 encode isoforms that have a methionine instead of leucine at position 51 conferring a mobility shift in triton-acid urea gel electrophoresis (historically, H2A.2 symbol was used to mark this difference) [franklin_non-allelic_1977]. H2AC1 gene (formely, called HIST1H2AA, TH2A) is the most divergent gene of the family, together with H2BC1 they share a common promoter and maifest tissue-specific expression (at least in testis and oocytes) [huynh_two_2016].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'1) A subset of clustered histones, which are normally expressed as replication-dependent histones, are expressed as polyadenylated mRNAs in adult non-dividing tissues to replenish histone pool in differentiated tissues [lyons_subset_2016]. 2) H2A.X histone variant is usually closely related to replication-dependent H2A histones in the same group of animals. In humans, H2A.X produces both polyadenylated mRNAs and mRNAs ending on a stem-loop. It is probale that it is ancestral to clustered H2A histones [talbert_histone_2021]. 3) The H2AJ gene on chromosome 12 encoding H2A.J histone variant is sequence wise very similar to other canonical H2As in human. However, it appears to produce only polyadenylated mRNA. See H2A.J variant description for details.');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
117,
'cH2A_(Mammalia)');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('franklin_non-allelic_1977',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Homo_sapiens)',
'franklin_non-allelic_1977');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('huynh_two_2016',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Homo_sapiens)',
'huynh_two_2016');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(118,
'cH2A_(Mus_musculus)  clustered H2A histones in mouse, often called canonical, replication-dependent, replication-coupled or "bulk" H2A histones. repliation-dependent histones in mouse similar to human are found in several clusters. The largest cluster is found on chromosome 13 (more than 50 geens) and smaller clusters on chromosomes 3 and 11 [marzluff_human_2002]. There are 18 replication-dependent H2A genes currently annotated in mouse genome: 13 in cluster on chromosome 13, 4 in cluster on chromosome 3 and 1 on chromosome 11.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
118,
'cH2A_(Mammalia)');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('marzluff_human_2002',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A_(Mus_musculus)',
'marzluff_human_2002');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(119,
'H2A.Z.2.s1_(Homo_sapiens)  this is the main full length splice isoform of H2A.Z.2 in humans as compared to an slternatively spliced H2A.Z.2.s2 isofom which has an alternative shorter C-terminus [giaimo_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2.s1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
119,
'H2A.Z.2.s1_(Primates)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2.s1_(Homo_sapiens)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(120,
'H2A.Z.2.s2_(Homo_sapiens)  this is an alternatively spliced isoform of H2A.Z.2 in humans which has an alternative shorter C-terminus with respect to H2A.Z.2.s1 isoform. This isoform is expressed in a wide range of tissues, including brain tissues. Nucleosome containing H2A.Z.2.s2 isoform are less stable, than nuclesomes with the main isoform. [giaimo_histone_2019].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.Z.2.s2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
120,
'H2A.Z.2.s2_(Primates)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('H2A.Z.2.s2_(Homo_sapiens)',
'giaimo_histone_2019');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Homo_sapiens)',
'variant',
null,
null,
null,
'H2A.X_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('H2A.X_(Mus_musculus)',
'variant',
null,
null,
null,
'H2A.X_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(121,
'cH2B_(Homo_sapiens)  clustered H2B histones in human, often called canonical, replication-dependent, replication-coupled or "bulk" H2B histones. For a general description see cH2B_(Animals) class. Replication-dependent histones in humans are found in four loci: a large cluster on chromosome 6 (more than 60 genes), two clusters on chromosome 1 (10-12 genes and 4 genes) and a single H4 gene on chromosome 12. Humans have 19 H2B genes that code for replication-dependent H2B histones. The cluster on chromosome 6 encodes 15 H2B genes (H2BC1, H2BC3-H2BC15, H2BC17) and several pseudogenes. The first cluster on chromosome 1 encodes 2 genes (H2BC18, H2BC21) and two pseudogenes (H2BC19P, H2BC20P), and the second cluster on chromosome 1 endodes one gene (H2BC26) and one pseudogene (H2BC27P). One additional gene H2BC12L is represented by a human-specific duplication of the H2BC12 gene from the chromosome 6 onto chromosome 21, the gene appears to be expressed, its protein sequence is expected to have two nonsynonymous substitutions with respect to H2BC12 gene. 19 cH2B genes in human enconde 15 protein variants. H2BC1 gene (formely, called HIST1H2BA, TH2B) is the most divergent gene of the family, together with H2AC1 they share a common promoter and maifest tissue-specific expression (at least in testis and oocytes) [huynh_two_2016].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
'1) A subset of clustered histones, which are normally expressed as replication-dependent histones, are expressed as polyadenylated mRNAs in adult non-dividing tissues to replenish histone pool in differentiated tissues [lyons_subset_2016]. ');
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Homo_sapiens)',
'variant',
null,
null,
121,
'cH2B_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Homo_sapiens)',
'huynh_two_2016');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(122,
'cH2B_(Mus_musculus)  clustered H2B histones in mouse, often called canonical, replication-dependent, replication-coupled or "bulk" H2B histones. repliation-dependent histones in mouse similar to human are found in several clusters. The largest cluster is found on chromosome 13 (more than 50 genes) and smaller clusters on chromosomes 3 and 11 [marzluff_human_2002]. There are 18 replication-dependent H2B genes currently annotated in mouse genome: 15 in cluster on chromosome 13, 2 in cluster on chromosome 3 and 1 on chromosome 11.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
122,
'cH2B_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B_(Mus_musculus)',
'marzluff_human_2002');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(123,
'cH3.1_(Mammalia)  a mamal specific subvariant of cH3 histone in mammals. Mammalian cH3s have the primary cH3.2 isoform and a mammal-specific cH3.1 paralog [talbert_histone_2021]. cH3.2 is the most common replicative histone in eukaryotes, cH3.1 differs from it by only one residue at position 96 [ray-gallet_histone_2021].',
'Mammals (Mammalia)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3.1_(Mammalia)',
'variant',
'Mammalia',
'40674',
123,
'cH3_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3.1_(Mammalia)',
'talbert_histone_2021');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('ray-gallet_histone_2021',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3.1_(Mammalia)',
'ray-gallet_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(124,
'cH3.2_(Mammalia)  is a subvariant of cH3 histone in mammals, which corresponds to the most common replicative histone in eukaryotes, cH3.2 differs from cH3.2 by only one residue at position 96 [ray-gallet_histone_2021].',
'Mammals (Mammalia)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3.2_(Mammalia)',
'variant',
'Mammalia',
'40674',
124,
'cH3_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3.2_(Mammalia)',
'ray-gallet_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(125,
'cH2A.1_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC1 gene (formerly, HIST1H2AA, TH2A). This is the most divergent gene of the family, its protein product has differences in several internal positions as well as in the last 6 amino acids at the C-terminus with respect to the majority of clustered H2As. Its length is also one amino acid longer than for the rest of H2As (130 amio acid residues after initiator methionine cleavage). Together with H2BC1 they share a common promoter and manifest tissue-specific expression (at least in testis and oocytes) (see human protein atlas).  H2AC1 and H2BC1 are thought to be maternal effect factors and their expression was shown to enhance OSKM-induced cell reprogramming in human cells [huynh_two_2016]. See also description of cH2A.1_(Mus_musculus)  a related histone variant encoded by H2ac1 gene which has been characterized through a number of in vivo and in vitro studies.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
125,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.1_(Homo_sapiens)',
'huynh_two_2016');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(72,
'TH2A',
null,
null,
null,
'cH2A.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(73,
'TS H2A.1',
null,
null,
null,
'cH2A.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(126,
'cH2A.2_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC4, H2AC8 genes.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
126,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(127,
'cH2A.3_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC6 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.3_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
127,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(128,
'cH2A.4_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC7 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.4_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
128,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(129,
'cH2A.5_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC11, H2AC13, H2AC15, H2AC16, H2AC17 genes. This is an isoform represented by the most number of genes.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.5_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
129,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(130,
'cH2A.6_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC12 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.6_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
130,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(131,
'cH2A.7_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC14 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.7_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
131,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(132,
'cH2A.8_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human. It is the product of H2AC18 and H2AC19 genes. Together with cH2A.9_(Homo_sapiens) isoform (product of H2AC20 gene) this isoform has a methionine instead of leucine at position 51 relative to other cH2As in human (H2AL51M substitution). Historically the methionine containing isoforms were classified as H2A.2 histones, based on mobility differences in triton-acid urea gel electrophoresis[franklin_non-allelic_1977].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.8_(Homo_sapiens)',
'variant',
'Eukaryotes',
'2759',
132,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.8_(Homo_sapiens)',
'franklin_non-allelic_1977');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(133,
'cH2A.9_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human. It is the product of H2AC20 gene. Together with cH2A.8_(Homo_sapiens) isoform (product of H2AC18 and H2AC19 genes) this isoform has a methionine instead of leucine at position 51 relative to other cH2As in human (H2AL51M substitution). Historically the methionine containing isoforms were classified as H2A.2 histones, based on mobility differences in triton-acid urea gel electrophoresis[franklin_non-allelic_1977].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.9_(Homo_sapiens)',
'variant',
'Eukaryotes',
'2759',
133,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.9_(Homo_sapiens)',
'franklin_non-allelic_1977');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(134,
'cH2A.10_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC21 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.10_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
134,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(135,
'cH2A.11_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2A histones in human endoded by H2AC25 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.11_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
135,
'cH2A_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(136,
'cH2A.1_(Mus_musculus)  is an isoform (variant) of clustered (canonical) H2A histones in mouse endoded by H2ac1 gene (formerly, Hist1h2aa, Th2a). This is the most divergent gene of the family, its protein product has differences in the ?last 6 amino acids? at the C-terminus with respect to the majority of clustered H2As???. Together with H2bc1 gene they share a common promoter and manifest tissue-specific expression (at least in testis, oocytes and zygotes) [padavattan_structural_2015]. Disruption of Th2a and Th2b genes causes defects in spermatogenesis [shinagawa_disruption_2015]. H2ac1 and H2bc1 contribute to activation of the paternal genome after fertilization [shinagawa_histone_2014]. These variant facilitate OSKM-induced cell reprogramming [shinagawa_histone_2014].  X-ray structure of nucleosome harboring this variant have fewer histone-DNA contacts and perturbed L1-L1-loop interactions. Mutational in vivo analysis suggest histone tails and L1 loop are important for reprogramming[padavattan_structural_2015]. Differential scanning calorimetry analysis indicated that the H2ac1/H2bc1 complex was more stable than other combinations of canonical histones [shinagawa_histone_2014]. This variant is related to cH2A.1_(Homo_sapiens) encoded by H2A1C gene, is located in the same position at the largest histone gene cluster, however, their sequence differs at 18 positions. Note: Since this variant manifests similar features in mice and humans (tissue-specific expression, synteny, divergent sequence with respect to other canonical variants in each species) likely similar variants exist in all supraprimates or in higher taxa. Once and if sufficient evidence accumulates such variants may be grouped into a separate class.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2A.1_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
136,
'cH2A_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('padavattan_structural_2015',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.1_(Mus_musculus)',
'padavattan_structural_2015');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('shinagawa_disruption_2015',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.1_(Mus_musculus)',
'shinagawa_disruption_2015');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('shinagawa_histone_2014',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2A.1_(Mus_musculus)',
'shinagawa_histone_2014');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(74,
'Th2a',
null,
null,
null,
'cH2A.1_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(75,
'TS H2A.1',
null,
null,
null,
'cH2A.1_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(137,
'cH2B.1_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC1 gene (formerly, HIST1H2BA, TH2B). This is the most divergent gene of the family (around 85% identity with other cH2Bs) [zalensky_human_2002]. Its length is also one amino acid longer than for the rest of H2Bs (126 amio acid residues after initiator methionine cleavage). Together with H2AC1 they share a common promoter and manifest tissue-specific expression (at least in testis and oocytes) (see human protein atlas).  H2AC1 and H2BC1 are thought to be maternal effect factors and their expression was shown to enhance OSKM-induced cell reprogramming in human cells [huynh_two_2016]. See also description of cH2B.1_(Mus_musculus)  a related histone variant encoded by H2bc1 gene which has been characterized through a number of in vivo and in vitro studies. Phylogenetic analysis of cH2B.1 in mammals by Raman et al. suggests that when considered together with its N-terminal tail histones form a distinct phylogenetic clade with high bootstrap support [raman_novel_2022].',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
137,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('zalensky_human_2002',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Homo_sapiens)',
'zalensky_human_2002');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Homo_sapiens)',
'huynh_two_2016');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Homo_sapiens)',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(76,
'TH2B',
null,
null,
null,
'cH2B.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(77,
'TS H2B.1',
null,
null,
null,
'cH2B.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(78,
'hTSH2B',
null,
null,
null,
'cH2B.1_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(138,
'cH2B.2_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC3 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
138,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(139,
'cH2B.3_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC4, H2BC6, H2BC7, H2BC8, H2BC10 genes.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.3_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
139,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(140,
'cH2B.4_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC5 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.4_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
140,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(141,
'cH2B.5_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC9 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.5_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
141,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(142,
'cH2B.6_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC11 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.6_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
142,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(143,
'cH2B.7_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC12 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.7_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
143,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(144,
'cH2B.8_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC13 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.8_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
144,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(145,
'cH2B.9_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC14 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.9_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
145,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(146,
'cH2B.10_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC15 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.10_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
146,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(147,
'cH2B.11_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC17 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.11_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
147,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(148,
'cH2B.12_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC18 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.12_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
148,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(149,
'cH2B.13_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC21 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.13_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
149,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(150,
'cH2B.14_(Homo_sapiens)  is an isoform (variant) of clustered (canonical) H2B histones in human endoded by H2BC26 gene.',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.14_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
150,
'cH2B_(Homo_sapiens)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(151,
'cH2B.1_(Mus_musculus)  is an isoform (variant) of clustered (canonical) H2B histones in mouse endoded by H2bc1 gene (formerly, Hist1h2ba, Th2b). This is the most divergent gene of the family, its protein product has differences in INSERT HERE. Together with H2ac1 gene they share a common promoter and manifest tissue-specific expression (at least in testis, oocytes and zygotes) [padavattan_structural_2015]. Disruption of Th2a and Th2b genes causes defects in spermatogenesis [shinagawa_disruption_2015]. H2ac1 and H2bc1 contribute to activation of the paternal genome after fertilization [shinagawa_histone_2014]. These variant facilitate OSKM-induced cell reprogramming [shinagawa_histone_2014].  X-ray structure of nucleosome harboring this variant have fewer histone-DNA contacts and perturbed L1-L1-loop interactions. Mutational in vivo analysis suggest histone tails and L1 loop of cH2A.1 are important for reprogramming [padavattan_structural_2015]. Differential scanning calorimetry analysis indicated that the H2ac1/H2bc1 complex was more stable than other combinations of canonical histones [shinagawa_histone_2014]. This variant is related to cH2B.1_(Homo_sapiens) encoded by H2B1C gene, is located in the same position at the largest histone gene cluster, however, their sequence differs at INSERT HERE positions. Structural and in vitro studies suggest that cH2B.1-containing nucleosomes are less stable than RC H2B, which may allow H2B.1 to facilitate histone-protamine exchange during spermatogenesis. More recently, H2B.1 has also been detected in mouse oocytes, where its function is not yet understood [raman_novel_2022]. Note: Since this variant manifests similar features in mice and humans (tissue-specific expression, synteny, divergent sequence with respect to other canonical variants in each species) likely similar variants exist in all supraprimates or in higher taxa. Once and if sufficient evidence accumulates such variants may be grouped into a separate class.',
'Mus musculus (House mouse)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
'Govin et al. investigated the stability of nucleosomes incorporating cH2B.1/H2A.L.2 histone dimer (H2A.L.2 encoded by H2al2a gene in mouse was used) and concluded that they were less stable than nucleosomes containing somatic histones [govin_pericentric_2007].',
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.1_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
151,
'cH2B_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Mus_musculus)',
'padavattan_structural_2015');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Mus_musculus)',
'shinagawa_disruption_2015');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Mus_musculus)',
'shinagawa_histone_2014');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.1_(Mus_musculus)',
'raman_novel_2022');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(79,
'Th2b',
null,
null,
null,
'cH2B.1_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(80,
'TS H2B.1',
null,
null,
null,
'cH2B.1_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(152,
'cH2B.E_(Mus_musculus)  is an isoform (variant) of clustered (canonical) H2B histones in mouse endoded by H2bc21 gene (histone gene cluster on chromosome 3). It differs by four of five amino acids from other cH2Bs in mouse. It is expressed via a polyA-tail containing mRNA, typical of replication-independent variants in the main olfactory epithelium and the vomeronasal organ [santoro_activity-dependent_2012]. Santoro and Dulac showed that its expression is reduced by sensory activity and that it promotes neuronal cell death, such that inactive olfactory neurons display higher levels of the variant and shorter life spans. [santoro_activity-dependent_2012]',
'Mus musculus (House mouse)',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH2B.E_(Mus_musculus)',
'variant',
'Mus musculus',
'10090',
152,
'cH2B_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`publication`
(`id`,
`title`,
`doi`,
`author`,
`year`)
VALUES
('santoro_activity-dependent_2012',
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH2B.E_(Mus_musculus)',
'santoro_activity-dependent_2012');
INSERT INTO `curatedhitdb`.`alternative_name`
(`id`,
`name`,
`taxonomy`,
`gene`,
`splice`,
`histone`)
VALUES
(81,
'H2B.21',
null,
null,
null,
'cH2B.E_(Mus_musculus)');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(153,
'cH3.1_(Homo_sapiens)  a mammal-specific cH3.1 paralog of canonical H3 histone in human encoded by the following 10 genes on chromosome 6: H3C1-H3C4, H3C6-H3C8, H3C10-H3C12. cH3.2 is the most common replicative histone in eukaryotes, cH3.1 differs from it by only one residue at position 96 [ray-gallet_histone_2021].',
'Homo sapiens',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3.1_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
153,
'cH3.1_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3.1_(Homo_sapiens)',
'ray-gallet_histone_2021');
INSERT INTO `curatedhitdb`.`histone_description`
(`id`,
`summary`,
`taxonomy`,
`genes`,
`evolution`,
`expression`,
`knock_out`,
`function`,
`sequence`,
`localization`,
`deposition`,
`structure`,
`interactions`,
`disease`,
`caveats`)
VALUES
(154,
'cH3.2_(Homo_sapiens)  cH3.2 cH3 histone isoform in human, encoded by the following 3 genes on chromosome 1: H3C13, H3C14, H3C15. cH3.2 is the most common replicative histone in eukaryotes, cH3.1 differs from it by only one residue at position 96 [ray-gallet_histone_2021].',
'Homo sapiens',
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null,
null);
INSERT INTO `curatedhitdb`.`histone`
(`id`,
`level`,
`taxonomic_span`,
`taxonomic_span_id`,
`description`,
`parent`)
VALUES
('cH3.2_(Homo_sapiens)',
'variant',
'Homo sapiens',
'9606',
154,
'cH3.2_(Mammalia)');
INSERT INTO `curatedhitdb`.`histone_has_publication`
(`histone_id`,
`publication_id`)
VALUES
('cH3.2_(Homo_sapiens)',
'ray-gallet_histone_2021');