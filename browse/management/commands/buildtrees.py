from django.core.management.base import BaseCommand, CommandError
from browse.models import *

import os, shutil, configparser, io, subprocess, logging, json
from itertools import cycle

from Bio import SeqIO
from Bio import Phylo
from Bio.Phylo import PhyloXML
from Bio.Phylo import PhyloXMLIO

config = configparser.ConfigParser()
config.read('./histonedb.ini')

import xml.etree.ElementTree as ET
ET.register_namespace("", "http://www.phyloxml.org/1.10/phyloxml.xsd")

colors7 = [
    "#000000",
    "#66c2a5",
    "#fc8d62",
    "#8da0cb",
    "#e78ac3",
    "#a6d854",
    "#ffd92f",
    "#e5c494"]

colors = [
    "#8dd3c7",
    "#E6E600",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9",
    "#bc80bd",
    "#ccebc5",
    "#ffed6f",
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
    "#ffed6f", # !!!
]

class Command(BaseCommand):
    help = 'Building data for variant trees using ClustalW2'
    seed_directory = config['WEB_DATA']['seeds']
    trees_path = config['WEB_DATA']['trees']

    # Logging info
    logging.basicConfig(filename=os.path.join(config['LOG']['database_log'], "buildtrees.log"),
                        format='%(asctime)s %(name)s %(levelname)-8s %(message)s',
                        level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')
    log = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument(
            "-f", 
            "--force", 
            default=False, 
            action="store_true", 
            help="Force the recreation of the varaint trees. If True and an phyloxml file is not present, the program will re-build each tree and add jsPhyloSVG features")

    def handle(self, *args, **options):
        self.log.info('=======================================================')
        self.log.info('===                 buildtrees START                ===')
        self.log.info('=======================================================')

        if options["force"]:
            if os.path.exists(self.seed_directory) and os.path.isdir(self.seed_directory):
                shutil.rmtree(self.seed_directory)
            # shutil.copytree(os.path.join(config['DATA']['directory'], 'seeds'), self.seed_directory)
            shutil.copytree(os.path.join(config['DATA']['directory'], 'draft_seeds'), self.seed_directory)

        with open(config['DATA']['variants'], encoding='utf-8') as f:
            self.variants_tree = json.load(f)['tree']

        self.make_trees(force=options["force"])
        self.add_features()

        self.log.info('=======================================================')
        self.log.info('===        buildtrees SUCCESSFULLY finished         ===')
        self.log.info('=======================================================')

    def get_variants_list(self, type=None):
        dl = self.variants_tree[type] if type else self.variants_tree
        if isinstance(dl, dict):
            keys_list = list(dl.keys())
            for dv in dl.values():
                keys_list += get_variants_list(dv)
            return keys_list
        return []

    def make_trees(self, force=False):
        for hist_type in self.variants_tree.keys():
            self.log.info("Creating tree for {}".format(hist_type))

            final_tree_name = os.path.join(self.trees_path, "{}_no_features.xml".format(hist_type))
            if not force and os.path.isfile(final_tree_name):
                continue

            if not os.path.exists(self.trees_path):
                os.makedirs(self.trees_path)

            #Combine all variants for a core histone type into one unaligned fasta file
            combined_seed_file = os.path.join(self.trees_path, "{}.fasta".format(hist_type))
            combined_seed_aligned = os.path.join(self.trees_path, "{}_aligned.fasta".format(hist_type))
            with open(combined_seed_file, "w") as combined_seed:
                for hist_var in self.get_variants_list(hist_type):
                    for s in SeqIO.parse(os.path.join(self.seed_directory, f"{hist_var}.fasta"), "fasta"):
                        s.seq = s.seq.ungap("-")
                        SeqIO.write(s, combined_seed, "fasta")

            #Create trees and convert them to phyloxml
            tree = os.path.join(self.trees_path, "{}_aligned.ph".format(hist_type))
            subprocess.call(["muscle", "-in", combined_seed_file, '-out', combined_seed_aligned])
            self.log.info(" ".join(["clustalw", "-infile={}".format(combined_seed_aligned), "-outfile={}".format(final_tree_name), '-tree']))
            subprocess.call(["clustalw", "-infile={}".format(combined_seed_aligned), "-outfile={}".format(final_tree_name), '-tree'])
            Phylo.convert(tree, 'newick', final_tree_name, 'phyloxml')
    
    def add_features(self):
        for hist_type in self.variants_tree.keys():
            self.log.info(hist_type)
            tree_path = os.path.join(self.trees_path, "{}_no_features.xml".format(hist_type))
            tree = ET.parse(tree_path)
            parent_map = {c: p for p in tree.getiterator() for c in p}

            for phylogeny in tree.iter("{http://www.phyloxml.org}phylogeny"):
                render = ET.Element("render")
                
                parameters = ET.Element("parameters")
                circular = ET.Element("circular")
                radius = ET.Element("bufferRadius")
                radius.text = "0.5"
                circular.append(radius)
                parameters.append(circular)
                render.append(parameters)
                
                charts = ET.Element("charts")
                group = ET.Element("group", attrib={"type":"integratedBinary", "thickness":"20"})
                charts.append(group)
                render.append(charts)

                styles = ET.Element("styles")

                variants = list(Variant.objects.filter(hist_type__id=hist_type).order_by("id").values_list("id", flat=True))

                for i, variant in enumerate(variants):
                    color = colors[i]
                    background = ET.Element("{}".format(variant.replace(".","")), attrib={"fill":color, "stroke":color})
                    if not variant.startswith(hist_type):
                        #Remove descriptor
                        start, name = variant[:variant.find(hist_type)], variant[variant.find(hist_type):]
                        if len(start) > 3 and start != "canonical_":
                            start = start[0:3]
                        name = start+name
                    else:
                        name = variant
                    self.log.info("Adding {}".format(name))
                    #uncomment following line to remove names
                    # name=''
                    label = ET.Element("markgroup{}".format(variant.replace(".","")), attrib={"fill":"#000", "stroke":"#000", "opacity":"0.7", "label":name.replace("canonical","ca").replace("_"," "), "labelStyle":"sectorHighlightText"})
                    styles.append(background)
                    styles.append(label)
                #Let's add default markgroup with no label
                label = ET.Element("markgroupDEF", attrib={"fill":"#000", "stroke":"#000", "opacity":"0.7", "label":'', "labelStyle":"sectorHighlightText"})
                styles.append(background)
                styles.append(label)

                label_sector = ET.Element("sectorHighlightText", attrib={"font-family":"Verdana", "font-size":"14", "font-weight":"bold", "fill":"#FFFFFF", "rotate":"90"})
                styles.append(label_sector)
                render.append(styles)

                phylogeny.insert(0, render)

                remove = []

                #Here we need to decide if we have enough space to output group name:
                #count how many clades we have in a row
                #and if more than 3, set retrospectively the group name
                inrow_counter=0
                old_var='';
                clade_hist=[]
                for clade in phylogeny.iter("{http://www.phyloxml.org}clade"):
                    name = clade.find("{http://www.phyloxml.org}name")
                    self.log.info("CLADE {}".format(clade))
                    try:
                        self.log.info(name.text)
                    except:
                        pass
                    if name is not None:
                        self.log.info(name.text)
                    
                        try:
                            genus, gi, partial_variant = name.text.split("|")
                        except ValueError:
                            remove.append(clade)
                            continue

                        if "canonical" in partial_variant:
                            # partial_variant = partial_variant.replace("_", "")
                            # if we uncomment this line the SVG of the tree is screwed up, Alexey, 12/30/15
                            self.log.info("Partial variant")
                            self.log.info(" ".join([genus, gi, partial_variant]))

                        for variant in variants:
                            if variant in partial_variant:
                                break
                        else:
                            continue
                        #Here is the group naming trick
                        if(old_var==variant):
                            inrow_counter+=1
                        else:
                            if(inrow_counter>2):
                                #retrospectively set the markup
                                for c in clade_hist:
                                    chart = ET.Element("chart")
                                    group = ET.Element("group")
                                    group.text = "markgroup{}".format(old_var.replace(".", ""))
                                    chart.append(group)
                                    c.append(chart)
                            else:
                                for c in clade_hist:
                                    chart = ET.Element("chart")
                                    group = ET.Element("group")
                                    group.text = "markgroupDEF"
                                    chart.append(group)
                                    c.append(chart)
                            inrow_counter=0
                            clade_hist=[]
                        old_var=variant
                        clade_hist.append(clade)
                        ############

                        name.attrib = {"bgStyle": variant.replace(".", "")}

                        name.text = genus


                        annotation = ET.Element("annotation")
                        desc = ET.Element("desc")
                        desc.text = "Variant {} from {} ({})".format(variant, genus, gi)
                        uri = ET.Element("uri")
                        uri.text = "variant/{}/{}".format(variant,gi)
                        annotation.append(desc)
                        annotation.append(uri)
                        clade.append(annotation)
                if remove:
                    for clade in remove:
                        parent = parent_map[clade]
                        child = parent.remove(clade)

                #Finish markup
                if(inrow_counter>1):
                #retrospectively set the markup
                    for c in clade_hist:
                        chart = ET.Element("chart")
                        group = ET.Element("group")
                        group.text = "markgroup{}".format(old_var.replace(".", ""))
                        chart.append(group)
                        c.append(chart)
                else:
                    for c in clade_hist:
                        chart = ET.Element("chart")
                        group = ET.Element("group")
                        group.text = "markgroupDEF"
                        chart.append(group)
                        c.append(chart)

            with open(os.path.join(self.trees_path, "{}.xml".format(hist_type)), "w") as outfile:
                treestr = io.BytesIO()
                tree.write(treestr)
                treestr = treestr.getvalue().decode("utf-8").replace("phy:", "")
                header, treestr = treestr.split("\n", 1)
                treestr = '<phyloxml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.phyloxml.org http://www.phyloxml.org/1.10/phyloxml.xsd" xmlns="http://www.phyloxml.org">\n'+treestr
                outfile.write(treestr)
