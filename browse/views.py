import sys
import json
from  more_itertools import unique_everseen

from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.shortcuts import get_list_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.templatetags.static import static

from browse.forms import AdvancedFilterForm, AnalyzeFileForm
from browse.search import HistoneSearch
from browse.process_upload import process_upload, process_upload_blast, InvalidFASTA

from colour import Color
import pandas as pd

#Django libraires
from browse.models import *
from browse.aggregate_functions import GroupConcat
from djangophylocore.models import *

#BioPython
from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord
from Bio import Medline
from Bio import Entrez
Entrez.email = "HistoneDB_user@ncbi.nlm.nih.gov"

from django.db.models import Min, Max, Count, Q, Value, IntegerField, CharField, Case, When
from django.db.models.functions import Coalesce

#Set2 Brewer, used in variant colors
colors7 = [
    "#000000", #Fix for cononical
    "#66c2a5",
    "#fc8d62",
    "#8da0cb",
    "#e78ac3",
    "#a6d854",
    "#ffd92f",
    "#e5c494"
    ]

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
]

def help(request):
    data = {
        "filter_form":AdvancedFilterForm(), 
        "original_query":{},
        "current_query":{}
    }
    return render(request, 'help.html', data)

def browse_types(request):
    """Home"""
    data = {
        "filter_form":AdvancedFilterForm(), 
        "original_query":{},
        "current_query":{}
    }
    return render(request, 'browse_types.html', data)

# def browse_variants(request, histone_type):
#     try:
#         hist_type = Histone.objects.get(id=histone_type)
#     except:
#         return "404"
#
#     variants = hist_type.variants.filter(parent_id=None).annotate(num_sequences=Count('sequences')).order_by("id").all().values_list("id", "num_sequences", "taxonomic_span")
#     curated_variants = hist_type.variants.filter(parent_id=None).filter(Q(sequences__reviewed=True) | Q(sequences__reviewed__isnull=True)).annotate(num_sequences=Count('sequences')).order_by("id").all().values_list("num_sequences", flat=True)
#     # curated_variants = hist_type.variants.filter(parent_id=None).filter(sequences__reviewed=True).annotate(num_sequences=Coalesce(Count('sequences'), 0)).order_by("id").all().values_list("num_sequences", flat=True)
#     variants = [{'id': id, 'num_curated': num_curated, 'num_all': num_all,
#                  'alternate_names': ", ".join(Variant.objects.get(id=id).old_names.values_list("name", flat=True)),
#                  'tax_span': tax_span, 'color': color,
#                  'children': get_variants_children(id)} \
#                 for (id, num_all, tax_span), num_curated, color in zip(variants, curated_variants, colors)]
#     children = Variant.objects.get(id=variants[0]['id']).direct_children.annotate(num_sequences=Count('sequences')).order_by(
#         "id").all().values_list("id", "num_sequences", "taxonomic_span")
#     curated_children = Variant.objects.get(id=variants[0]['id']).direct_children.filter(Q(sequences__reviewed=True) | Q(sequences__reviewed__isnull=True)).annotate(
#         num_sequences=Count('sequences')).order_by("id").all().values_list("num_sequences", flat=True)
#     # assert False
#
#
#     data = {
#         "histone_type": histone_type,
#         "histone_description": hist_type.description,
#         "browse_section": "type",
#         "name": histone_type,
#         "variants": variants,
#         "tree_url": "browse/trees/{}.xml".format(hist_type.id),
#         "seed_url": reverse("browse:get_seed_aln_and_features", args=[hist_type.id]),
#         "filter_form": AdvancedFilterForm(),
#     }
#
#     #Store sequences in session, accesed in get_sequence_table_data
#     data["original_query"] = {"id_hist_type":histone_type}
#
#     return render(request, 'browse_variants.html', data)
def browse_variants(request, histone_type):
    try:
        hist_type = Histone.objects.get(id=histone_type)
    except:
        return "404"

    # variants = hist_type.variants.filter(parent_id=None).annotate(num_sequences=Count('sequences')).order_by("id").all().values_list("id", "num_sequences", "taxonomic_span")
    variants = hist_type.variants.annotate(alternate_names=GroupConcat('old_names__name', separator=', '),
                                           num_sequences=Count('sequences'),
                                           num_curated=Count(Case(When(sequences__reviewed=True, then=1), output_field=IntegerField()))).all()

    variants_query = str(variants.query)
    variants_num = variants.values_list("id", "num_sequences", "num_curated", "alternate_names", "taxonomic_span")
    # curated_variants = hist_type.variants.filter(parent_id=None).filter(Q(sequences__reviewed=True) | Q(sequences__reviewed__isnull=True)).annotate(num_sequences=Count('sequences')).order_by("id").all().values_list("num_sequences", flat=True)
    # curated_variants = hist_type.variants.filter(parent_id=None).filter(sequences__reviewed=True).annotate(num_sequences=Coalesce(Count('sequences'), 0)).order_by("id").all().values_list("num_sequences", flat=True)
    # variants = [{'id': id, 'num_curated': num_curated, 'num_all': num_all,
    #              'alternate_names': ", ".join(Variant.objects.get(id=id).old_names.values_list("name", flat=True)),
    #              'tax_span': tax_span, 'color': color} \
    #             for (id, num_all, tax_span), num_curated, color in zip(variants, curated_variants, colors)]
    # assert False

    data = {
        "histone_type": histone_type,
        "histone_description": hist_type.description,
        "browse_section": "type",
        "name": histone_type,
        "variants": variants,
        "colors": colors,
        "tree_url": "browse/trees/{}.xml".format(hist_type.id),
        "seed_url": reverse("browse:get_seed_aln_and_features", args=[hist_type.id]),
        "filter_form": AdvancedFilterForm(),
    }

    #Store sequences in session, accesed in get_sequence_table_data
    data["original_query"] = {"id_hist_type":histone_type}

    return render(request, 'browse_variants.html', data)

def browse_variant_with_highlighted_sequence(request, histone_type, variant, accession):
    return browse_variant(request, histone_type, variant, accession)

def browse_variant(request, histone_type, variant, accession=None):
    """"Dispaly the browse variant page

    Parameters
    ----------
    request: Django request
    histone_type: {"H2A", "H2B", "H3", "H4", "H1"}
    variant: str
        Name of variant
    accession: str or int
        ACCESSION to select to show it curated sequence browser. Optional. If specified, should open curated sequences page and activate this variant.
    """
    # variant = variant.replace("_", "") if "canonical" in variant else variant
    #the previous line currenly breaks the code. ALEXEY, 12/30/15
    try:
        variant = Variant.objects.get(id=variant)
    except:
        return "404"

    #This is a hack to open a page with features from Analyze your seqs page, where we do not know the type
    # Then we say type is ALL , ALEXEY
    if histone_type=='ALL':
        histone_type=Variant.objects.get(id=variant).hist_type

    go_to_curated = accession is not None
    print(accession, "!!!!!!!")
    go_to_accession = accession if accession is not None else 0
    highlight_human=False
#Here we want always by default highlight human
    if not go_to_curated:
        try:
            go_to_accession=Sequence.objects.filter(variant=variant,taxonomy__id__in=["9606","10090"]).order_by('taxonomy').first().id
            highlight_human=True
        except:
            pass

    green = Color("#66c2a5")
    red = Color("#fc8d62")
    color_range = list(map(str, red.range_to(green, 12)))
    
    scores = Sequence.objects.filter(
            variant__id=variant,
            all_model_scores__used_for_classification=True
       ).annotate(
            score=Max("all_model_scores__score")
       ).aggregate(
            max=Max("score"), 
            min=Min("score")
       )

#Distinct will not work here, because we order by "start", which is also included - see https://docs.djangoproject.com/en/dev/ref/models/querysets/#distinct
    features_gen = Feature.objects.filter(template__variant="General{}".format(histone_type)).values_list("name", "description", "color").distinct()
    features_var = Feature.objects.filter(template__variant=variant).values_list("name", "description", "color").distinct()

    features_gen=list(unique_everseen(features_gen))
    features_var=list(unique_everseen(features_var))

    sequences = Sequence.objects.filter(
            variant__id=variant,
            all_model_scores__used_for_classification=True
       ).annotate(
            score=Max("all_model_scores__score")
       ).order_by("score")

    human_sequence = sequences.filter(taxonomy__name="homo sapiens", reviewed=True).first()
    # if not human_sequence:
    #     human_sequence = sequences.filter(taxonomy__name="homo sapiens").first()
    if not human_sequence:
        human_sequence = sequences.filter(reviewed=True).first()
    print(human_sequence)

    # if 'generic' in variant.id:
    #     sequences = Sequence.objects.filter(variant__id=variant)
    #     human_sequence = sequences.filter(reviewed=True).first()

    try:
        publication_ids = ",".join(map(str, variant.publication_set.values_list("id", flat=True)))
        handle = Entrez.efetch(db="pubmed", id=publication_ids, rettype="medline", retmode="text")
        records = Medline.parse(handle)
        publications = ['{}. "{}" <i>{}</i>, {}. PMID: <a href="http://www.ncbi.nlm.nih.gov/pubmed/?term={}">{}</a>'.format(
            "{}, {}, et al".format(*record["AU"][0:2]) if len(record["AU"])>2 else " and ".join(record["AU"]) if len(record["AU"])==2 else record["AU"][0],
            record["TI"],
            record["TA"],
            re.search("\d\d\d\d",record["SO"]).group(0),
            record["PMID"],
            record["PMID"],
           ) for record in records]
    except:
        publications=["PMID: "+str(x) for x in variant.publication_set.values_list("id", flat=True)]

    data = {
        "hist_type": variant.hist_type.id,
        "variant": variant.id,
        "name": variant.id,
        "features_gen": features_gen,
        "features_var": features_var,
        "human_sequence": human_sequence.id,
        "publications": publications,
        "sunburst_url": static("browse/sunbursts/{}/{}.json".format(variant.hist_type.id, variant.id)),
        "seed_url": reverse("browse.views.get_seed_aln_and_features", args=[variant.id]),
        "colors": color_range,
        "score_min": scores["min"],
        "score_max": scores["max"],
        "browse_section": "variant",
        "description": variant.description,
        "alternate_names": ", ".join(variant.old_names.values_list("name", flat=True)),
        "filter_form": AdvancedFilterForm(),
        "go_to_curated": go_to_curated,
        "go_to_accession": go_to_accession,
        "highlight_human": highlight_human,
    }

    data["original_query"] = {"id_variant":variant.id}

    return render(request, 'browse_variant.html', data)

def browse_variant_clipped(request, variant, accession=None):
    return browse_variant(request, get_type_by_variant(variant), variant, accession)

def search(request):
    data = {"filter_form": AdvancedFilterForm()}

    if request.method == "POST": 
        query = request.POST.copy()
    else:
        query = request.GET.copy()
    result = HistoneSearch(query, navbar="search" in list(query.keys()))

    data["original_query"] = query

    if len(result.errors) == 0:
        data["result"] = True
    else:
        data["filter_errors"] = result.errors

    if result.redirect: 
        return result.redirect

    green = Color("#66c2a5")
    red = Color("#fc8d62")
    data["colors"] = list(map(str, red.range_to(green, 12)))

    data["score_min"], data["score_max"] = result.get_score_range()

    return render(request, 'search.html', data)

def basket(request):
    data = {
        "filter_form":AdvancedFilterForm(), 
        "original_query":{},
        "current_query":{}
    }
    return render(request, 'basket.html', data)

def analyze(request):
    data = {
        "filter_form":AdvancedFilterForm(), 
        "original_query":{},
        "current_query":{}
    }
    if request.method == "POST":
        if request.FILES.get("file"):
            format="file"
            sequence = request.FILES["file"]
        elif request.POST.get("sequence"):
            format = "text"
            sequence = request.POST["sequence"]
        else:
            sequence = None
            data["error"] = "Unable to read sequence."

        if sequence:
            try:
                data["result"] = process_upload(sequence, format, request)
            except InvalidFASTA as e:
                # data["error"] = "{}: {}".format(e.__class__.__name__, e.message)
                data["error"] = "{}".format(e.message)

                data["analyze_form"] = AnalyzeFileForm()

        data["search_type"] = type
    else:
        data["analyze_form"] = AnalyzeFileForm(initial={"sequence":">Arabidopsis|NP_181415.1|H2A.Z Arabidopsis_H2A.Z_15224957\nMAGKGGKGLLAAKTTAA\nAANKDSVKKKSISRSSRAGIQFPVGRIHRQLKQRVSAHGRVGATAAVYTASI\nLEYLTAEVLELAGNASKDLKVKRITPRHLQLAIRGDEELDTLIKGTIAGGGVI\nPHIHKSLVNKVTKD"})
    # print data.get('result',0)
    return render(request, 'analyze.html', data)

def blast_sequences(request):
    data = {
        "filter_form":AdvancedFilterForm(),
        "original_query":{},
        "current_query":{}
    }
    if request.method == "POST":
        if request.FILES.get("file"):
            format="file"
            sequences = request.FILES["file"]
        elif request.POST.get("sequence"):
            format = "text"
            sequences = request.POST["sequence"]
        else:
            sequences = None
            data["error"] = "Unable to read sequence."

        if sequences:
            try:
                data["result"] = process_upload_blast(sequences, format, request)
            except InvalidFASTA as e:
                # data["error"] = "{}: {}".format(e.__class__.__name__, e.message)
                # data["error"] = "{}".format(e.message)
                data["error"] = "{}".format(e)

                data["analyze_form"] = AnalyzeFileForm()

        data["search_type"] = type
    else:
        data["analyze_form"] = AnalyzeFileForm(initial={"sequence":">Arabidopsis|NP_181415.1|H2A.Z Arabidopsis_H2A.Z_15224957\nMAGKGGKGLLAAKTTAA\nAANKDSVKKKSISRSSRAGIQFPVGRIHRQLKQRVSAHGRVGATAAVYTASI\nLEYLTAEVLELAGNASKDLKVKRITPRHLQLAIRGDEELDTLIKGTIAGGGVI\nPHIHKSLVNKVTKD\n>Trypanosoma|XP_846259.1|H2A.Z Trypanosoma_H2A.Z_72391930\nMSLTGDDAVPQAPLVGGVAMSPEQASALTGGKLGGKAVGPAHGKGKGKGKGK\nRGGKTGGKAGRRDKMTRAARADLNFPVGRIHSRLKDGLNRKQRCGASAAIYC\nAALLEYLTSEVIELAGAAAKAQKTERIKPRHLLLAIRGDEELNQIVNATIAR\nGGVVPFVHKSLEKKIIKKSKRGS"})
    # print data.get('result',0)
    return render(request, 'blast_sequences.html', data)

def human(request):
    # human_proteins = pd.read_csv('/home/l_singh/histonedb/histone_proteins.csv').fillna('')
    # human_proteins = pd.read_csv(os.path.join(settings.BASE_DIR, "histone_proteins.csv")).fillna('')
    # human_proteins = human_proteins[['Histone type', 'Previous HGNC Symbol', 'Histone variant', 'HGNC Symbol']]
    data = {
        "filter_form":AdvancedFilterForm(),
        "original_query":{},
        "current_query":{}
    }
    return render(request, 'human.html', data)

def statistics_test_delete(request):
    # data = {}
    # data = {
    #     "filter_form": AdvancedFilterForm(),
    #     "original_query": {},
    #     "current_query": {}
    # }
    # return render(request, 'statistics.html', data)
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    import mpld3
    from mpld3 import plugins
    np.random.seed(9615)

    N = 100
    df = pd.DataFrame((.1 * (np.random.random((N, 5)) - .5)).cumsum(0),
                      columns=['a', 'b', 'c', 'd', 'e'], )

    # plot line + confidence interval
    fig, ax = plt.subplots()
    ax.grid(True, alpha=0.3)

    for key, val in df.iteritems():
        l, = ax.plot(val.index, val.values, label=key)
        ax.fill_between(val.index,
                        val.values * .5, val.values * 1.5,
                        color=l.get_color(), alpha=.4)

    handles, labels = ax.get_legend_handles_labels()  # return lines and labels
    interactive_legend = plugins.InteractiveLegendPlugin(zip(handles,
                                                             ax.collections),
                                                         labels,
                                                         alpha_unsel=0.5,
                                                         alpha_over=1.5,
                                                         start_visible=True)
    plugins.connect(fig, interactive_legend)

    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.set_title('Interactive legend', size=20)

    html_fig = mpld3.fig_to_html(fig, template_type='general')
    plt.close(fig)
    return render(request, 'statistics.html', {'figure': html_fig})

def statistics(request):
    from django.conf import settings
    import os
    import pickle

    general_stat = {'database_statistics':(Sequence.objects.all().count(),
                                           Sequence.objects.filter(reviewed=True).count(),
                                           Sequence.objects.filter(reviewed=False).count()),
                    'hist_type_stat': [(h.id,
                                        Sequence.objects.filter(variant__hist_type=h).count(),
                                        Sequence.objects.filter(variant__hist_type=h, reviewed=True).count(),
                                        Sequence.objects.filter(variant__hist_type=h, reviewed=False).count()) for h in
                                       Histone.objects.all()],
                    'hist_var_stat': [(v.id,
                                       Sequence.objects.filter(variant=v).count(),
                                       Sequence.objects.filter(variant=v, reviewed=True).count(),
                                       Sequence.objects.filter(variant=v, reviewed=False).count()) for v in
                                      Variant.objects.all()], }

    # with open(os.path.join(settings.STATIC_ROOT_AUX, "browse", "statistics", 'nr_small_per10_v4_20210622-152129', 'Variants_hist.pickle'), 'rb') as f:
    #     html_fig = pickle.load(f)

    # with open(os.path.join(settings.STATIC_ROOT_AUX, "browse", "statistics", 'nr_small_per10_v4_20210622-152129', 'test_html_fig.pickle'), 'rb') as f:
    #     html_fig = pickle.load(f)
    # return render(request, 'statistics.html', {'figure': html_fig, 'general_stat': general_stat})
    return render(request, 'statistics.html', {'general_stat': general_stat})


def get_sequence_table_data(request):
    """Downloads the previous search and converts into json required by Bootstrap table
    """
    
    if request.method == "GET":
        parameters =  request.GET.dict()
    else:
        assert 0, request.method
        #Returning 'false' stops Bootstrap table
        parameters = []
    
    results = HistoneSearch(parameters)

    if len(results.errors) > 0:
        #Returning 'false' stops Bootstrap table
        return "false"

    result = results.get_dict()
    # assert(len(result['rows'])>0)
    result["parameters"] = results.parameters
    result["method"] = request.method

    return JsonResponse(result)

def get_all_scores(request, ids=None):
    if ids is None and request.method == "GET" and "id" in request.GET:
        ids = request.GET.getlist("id")
    else:
        #Returning 'false' stops Bootstrap table
        return "false"
    
    variants = list(Variant.objects.all().order_by("id").values_list("id", "hmmthreshold"))
    indices = {variant: i for i, (variant, threshold) in enumerate(variants)}
    rows = [{} for _ in range(len(variants))]
    for i, (variant, threshold) in enumerate(variants):
        rows[i]["variant"] = "{} (T:{})".format(variant, round(threshold,1))
        for id in ids:
            rows[i][id] = "n/a"
        rows[i]["data"] = {}
        rows[i]["data"]["above_threshold"] = {id:False for id in ids}
        rows[i]["data"]["this_classified"] = {id:False for id in ids}
    
    for i, id in enumerate(ids):
        try:
            sequence = Sequence.objects.get(id=id)
        except:
            return "404"
        classified_variant = sequence.variant.id
        
        scores = sequence.all_model_scores.all().order_by("variant__id")

        for j, score in enumerate(scores):
            if score.variant.id in indices:
                threshold = score.variant.hmmthreshold
                if rows[indices[score.variant.id]][id] == "n/a" or score.score > rows[indices[score.variant.id]][id]:
                    rows[indices[score.variant.id]][id] = score.score
                    rows[indices[score.variant.id]]["data"]["above_threshold"][id] = score.score>=threshold
                    rows[indices[score.variant.id]]["data"]["this_classified"][id] = score.used_for_classification
                    try:
                        if score.regex:
                            rows[indices[score.variant.id]][id] += " (Has {} motif - classified from regex)".format(score.variant.id)
                    except:
                        pass
            
    return JsonResponse(rows, safe=False)

def get_all_sequences(request, ids=None):
    if ids is None and request.method == "GET" and "id" in request.GET:
        ids = request.GET.getlist("id")
    else:
        #Returning 'false' stops Bootstrap table
        return "false"

    format = request.GET.get("format", "json")
    download = request.GET.get("download", "false") == "true"

    sequences = Sequence.objects.filter(id__in=ids[:50]) 
    if format == "fasta":
        response = HttpResponse(content_type='text')

        if download:
            response['Content-Disposition'] = 'attachment; filename="histone_variants.fasta"'

        for s in sequences:
            response.write(str(s))

        return response

    else:
        sequences = [s.to_dict() for s in sequences]
        return JsonResponse(sequences, safe=False)

def get_aln_and_features(request, ids=None):
    from tools.hist_ss import get_variant_features
    from tools.L_shade_hist_aln import write_alignments
    import subprocess
    import io
    from Bio.Align import MultipleSeqAlignment
    from Bio.Align.AlignInfo import SummaryInfo
    from Bio.SeqRecord import SeqRecord
    
    save_dir = os.path.join(os.path.sep, "tmp", "HistoneDB")
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        os.chmod(save_dir,0o777)

    if ids is None and request.method == "GET" and "id" in request.GET:
        ids = request.GET.getlist("id")
        sequences = Sequence.objects.filter(id__in=ids)
        download = False
        upload = False
    elif request.GET.get("download", False) == "true":
        download = True
        upload = False
    else:
        #Returning 'false' stops Bootstrap table
        return "false"

    if request.GET.get("upload", False) == "true":
        uploaded_sequence = request.session.get("uploaded_sequences", [])
        if len(uploaded_sequence) > 0:
            try:
                variant = Variant.objects.get(id=uploaded_sequence[0]["variant"])
            except:
                if len(sequences) > 0:
                    variant = sequences[0].variant
                else:
                    return "false"

            uploaded_sequence = Sequence(
                id=uploaded_sequence[0]["id"], 
                variant=variant,
                sequence=uploaded_sequence[0]["sequence"],
                taxonomy=Taxonomy.objects.get(name=uploaded_sequence[0]["taxonomy"]))
            upload = True
            download = False
    

    if not download:
        if len(sequences) == 0:
            return None, None
        elif len(sequences) == 1:
            #Already aligned to core histone
            seq = sequences[0]
            hist_type = seq.variant.hist_type.id
            variants = [seq.variant]
            if upload:
                sequences = [uploaded_sequence, seq]
            else:
                #let's load the corresponding canonical
                try:
                    if(("canonical" in str(seq.variant)) or ("generic" in str(seq.variant))):
                        canonical=seq
                    elif(str(seq.variant.hist_type)=="H1"):
                        canonical=Sequence.objects.filter(variant_id='generic_'+str(seq.variant.hist_type),reviewed=True,taxonomy=seq.taxonomy)[0]
                    else:
                        canonical=Sequence.objects.filter(variant_id='canonical_'+str(seq.variant.hist_type),reviewed=True,taxonomy=seq.taxonomy)[0]
                except:
                    try: #try H2A.X as a substitute for canonical
                        if(str(seq.variant.hist_type)=='H2A'):
                            canonical=Sequence.objects.filter(variant_id='H2A.X',reviewed=True,taxonomy=seq.taxonomy)[0]
                        elif(str(seq.variant.hist_type)=='H3'): #Try H3.3
                            canonical=Sequence.objects.filter(variant_id='H3.3',reviewed=True,taxonomy=seq.taxonomy)[0]
                        elif(str(seq.variant.id)=='scH1'):
                            canonical=seq
                        else:
                            raise

                    except:
                        canonical=seq #we here default not to show the sequence by simply suppling itslef - only one line will be displayed
                        #default Xenopus
                        # if(str(seq.variant.hist_type)=="H1"):
                        #     canonical = Sequence(id="0000|xenopus|generic{}".format(hist_type), sequence=str(TemplateSequence.objects.get(variant="General{}".format(hist_type)).get_sequence().seq))
                        # else:
                        #     canonical = Sequence(id="0000|xenopus|canonical{}".format(hist_type), sequence=str(TemplateSequence.objects.get(variant="General{}".format(hist_type)).get_sequence().seq))
                sequences = [canonical, seq]
            sequence_label = seq.short_description
            
        else:
            seq = sequences[0]
            variants = list(Variant.objects.filter(id__in=sequences.values_list("variant", flat=True).distinct()))
            sequence_label = "Consensus"
        
        muscle = os.path.join(os.path.dirname(sys.executable), "muscle")
        process = subprocess.Popen([muscle], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        sequences = "\n".join([s.format() for s in sequences])
        aln, error = process.communicate(sequences.encode('utf-8'))
        seqFile = io.StringIO()
        seqFile.write(aln.decode('utf-8'))
        seqFile.seek(0)
        sequences = list(SeqIO.parse(seqFile, "fasta")) #Not in same order, but does it matter?
        msa = MultipleSeqAlignment(sequences)
        a = SummaryInfo(msa)
        cons = Sequence(id=sequence_label, variant_id=variants[0].id, taxonomy_id=1, sequence=str(a.dumb_consensus(threshold=0.1, ambiguous='X')))

        save_dir = os.path.join(os.path.sep, "tmp", "HistoneDB")
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        features = get_variant_features(cons, variants=variants, save_dir=save_dir)

        #A hack to avoid two canonical seqs
        unique_sequences = [sequences[0]] if len(sequences) == 2 and sequences[0].id == sequences[1].id else sequences
        # doing the Sequence.short_description work
        #Note that the gffs are also generated with the short description not
        sequences = [{"name":"QUERY" if "QUERY" in s.id else Sequence.long_to_short_description(s.id), "seq":str(s.seq)} for s in unique_sequences]
        # sequences = [{"name":s.id, "seq":str(s.seq)} for s in sequences]
        
        if sequence_label == "Consensus":
            sequences.insert(0, cons.to_dict(id=True))
            
        request.session["calculated_msa_seqs"] = sequences
        request.session["calculated_msa_features"] = features#.to_ict() if features else {}

        result = {"seqs":sequences, "features":features} #.full_gff() if features else ""}
        return JsonResponse(result, safe=False) 
    else:
        format = request.GET.get("format", "json")
        response = HttpResponse(content_type='text')
        response['Content-Disposition'] = 'attachment; filename="sequences.{}"'.format(format)

        
        sequences = request.session.get("calculated_msa_seqs", [])
        features = request.session.get("calculated_msa_features", "")
        #features = Features.from_dict(Sequence("Consensus"), features_dict) if features_dict else None

        if format == "fasta":
            for s in sequences:
                print(">{}\n{}".format(s["name"], s["seq"]), file=response)
        elif format == "gff":
            response.write(features) #.full_gff() if features else "")
        elif format == "pdf":
            aln = MultipleSeqAlignment([SeqRecord(Seq(s["seq"]), id=s["name"]) for s in sequences[1:]])
            result_pdf = write_alignments(
                [aln], 
                save_dir = save_dir
           )

            with open(result_pdf) as pdf:
                response.write(pdf.read())

            #Cleanup
            os.remove(result_pdf)
        else:
            #Default format is json
            result = {"seqs":sequences, "features":features} #.full_gff() if features else ""}
            response.write(json.dumps(result))

        return response

def get_aln_and_features_1(request, ids=None):
    from tools.hist_ss import get_variant_features
    from tools.L_shade_hist_aln import write_alignments
    import subprocess
    import io
    from Bio.Align import MultipleSeqAlignment
    from Bio.Align.AlignInfo import SummaryInfo
    from Bio.SeqRecord import SeqRecord

    save_dir = os.path.join(os.path.sep, "tmp", "HistoneDB")
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        os.chmod(save_dir,0o777)

    if ids is None and request.method == "GET" and "id" in request.GET:
        ids = request.GET.getlist("id")
        sequences = Sequence.objects.filter(id__in=[full_id.split('-')[0] for full_id in ids])
        # print(ids)
        # print([full_id.split('-')[0] for full_id in ids])
        download = False
        upload = False
    elif request.GET.get("download", False) == "true":
        download = True
        upload = False
    else:
        #Returning 'false' stops Bootstrap table
        return "false"

    if request.GET.get("upload", False) == "true":
        uploaded_sequence = request.session.get("uploaded_sequences", [])
        # uploaded_sequence = uploaded_sequence[sequences[0].id]
        uploaded_sequence = uploaded_sequence[ids[0]]
        if len(uploaded_sequence) > 0:
            try:
                variant = Variant.objects.get(id=uploaded_sequence[0]["variant"])
            except:
                if len(sequences) > 0:
                    variant = sequences[0].variant
                else:
                    return "false"

            uploaded_sequence = Sequence(
                id=uploaded_sequence[0]["id"],
                variant=variant,
                sequence=uploaded_sequence[0]["sequence"],
                taxonomy=Taxonomy.objects.get(name=uploaded_sequence[0]["taxonomy"]))
            upload = True
            download = False


    if not download:
        if len(sequences) == 0:
            return None, None
        elif len(sequences) == 1:
            #Already aligned to core histone
            seq = sequences[0]
            hist_type = seq.variant.hist_type.id
            variants = [seq.variant]
            if upload:
                sequences = [uploaded_sequence, seq]
            else:
                #let's load the corresponding canonical
                try:
                    if(("canonical" in str(seq.variant)) or ("generic" in str(seq.variant))):
                        canonical=seq
                    elif(str(seq.variant.hist_type)=="H1"):
                        canonical=Sequence.objects.filter(variant_id='generic_'+str(seq.variant.hist_type),reviewed=True,taxonomy=seq.taxonomy)[0]
                    else:
                        canonical=Sequence.objects.filter(variant_id='canonical_'+str(seq.variant.hist_type),reviewed=True,taxonomy=seq.taxonomy)[0]
                except:
                    try: #try H2A.X as a substitute for canonical
                        if(str(seq.variant.hist_type)=='H2A'):
                            canonical=Sequence.objects.filter(variant_id='H2A.X',reviewed=True,taxonomy=seq.taxonomy)[0]
                        elif(str(seq.variant.hist_type)=='H3'): #Try H3.3
                            canonical=Sequence.objects.filter(variant_id='H3.3',reviewed=True,taxonomy=seq.taxonomy)[0]
                        elif(str(seq.variant.id)=='scH1'):
                            canonical=seq
                        else:
                            raise

                    except:
                        canonical=seq #we here default not to show the sequence by simply suppling itslef - only one line will be displayed
                        #default Xenopus
                        # if(str(seq.variant.hist_type)=="H1"):
                        #     canonical = Sequence(id="0000|xenopus|generic{}".format(hist_type), sequence=str(TemplateSequence.objects.get(variant="General{}".format(hist_type)).get_sequence().seq))
                        # else:
                        #     canonical = Sequence(id="0000|xenopus|canonical{}".format(hist_type), sequence=str(TemplateSequence.objects.get(variant="General{}".format(hist_type)).get_sequence().seq))
                sequences = [canonical, seq]
            sequence_label = seq.short_description

        else:
            seq = sequences[0]
            variants = list(Variant.objects.filter(id__in=sequences.values_list("variant", flat=True).distinct()))
            sequence_label = "Consensus"

        muscle = os.path.join(os.path.dirname(sys.executable), "muscle")
        process = subprocess.Popen([muscle], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        sequences = "\n".join([s.format() for s in sequences])
        aln, error = process.communicate(sequences.encode('utf-8'))
        seqFile = io.StringIO()
        seqFile.write(aln.decode('utf-8'))
        seqFile.seek(0)
        sequences = list(SeqIO.parse(seqFile, "fasta")) #Not in same order, but does it matter?
        msa = MultipleSeqAlignment(sequences)
        a = SummaryInfo(msa)
        cons = Sequence(id=sequence_label, variant_id=variants[0].id, taxonomy_id=1, sequence=str(a.dumb_consensus(threshold=0.1, ambiguous='X')))

        save_dir = os.path.join(os.path.sep, "tmp", "HistoneDB")
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        features = get_variant_features(cons, variants=variants, save_dir=save_dir)

        #A hack to avoid two canonical seqs
        unique_sequences = [sequences[0]] if len(sequences) == 2 and sequences[0].id == sequences[1].id else sequences
        # doing the Sequence.short_description work
        #Note that the gffs are also generated with the short description not
        sequences = [{"name":"QUERY" if "QUERY" in s.id else Sequence.long_to_short_description(s.id), "seq":str(s.seq)} for s in unique_sequences]
        # sequences = [{"name":s.id, "seq":str(s.seq)} for s in sequences]

        if sequence_label == "Consensus":
            sequences.insert(0, cons.to_dict(id=True))

        request.session["calculated_msa_seqs"] = sequences
        request.session["calculated_msa_features"] = features#.to_ict() if features else {}

        result = {"seqs":sequences, "features":features} #.full_gff() if features else ""}
        return JsonResponse(result, safe=False)
    else:
        format = request.GET.get("format", "json")
        response = HttpResponse(content_type='text')
        response['Content-Disposition'] = 'attachment; filename="sequences.{}"'.format(format)


        sequences = request.session.get("calculated_msa_seqs", [])
        features = request.session.get("calculated_msa_features", "")
        #features = Features.from_dict(Sequence("Consensus"), features_dict) if features_dict else None

        if format == "fasta":
            for s in sequences:
                print(">{}\n{}".format(s["name"], s["seq"]), file=response)
        elif format == "gff":
            response.write(features) #.full_gff() if features else "")
        elif format == "pdf":
            aln = MultipleSeqAlignment([SeqRecord(Seq(s["seq"]), id=s["name"]) for s in sequences[1:]])
            result_pdf = write_alignments(
                [aln],
                save_dir = save_dir
           )

            with open(result_pdf) as pdf:
                response.write(pdf.read())

            #Cleanup
            os.remove(result_pdf)
        else:
            #Default format is json
            result = {"seqs":sequences, "features":features} #.full_gff() if features else ""}
            response.write(json.dumps(result))

        return response

def get_sequence_features(request, ids=None):
    if ids is None and request.method == "GET" and "id" in request.GET:
        ids = request.GET.getlist("id")
    else:
        #Returning 'false' stops Bootstrap table
        return "false"

    download = request.GET.get("download", "false") == "true"
    sequences = Sequence.objects.filter(id__in=ids[:50])

    response = HttpResponse(content_type='text')

    if download:
        response['Content-Disposition'] = 'attachment; filename="histone_annotations.fasta"'

    response.write(Features.gff_colors())
    for s in sequences:
        response.write(str(s.features))

    return response

def get_seed_aln_and_features(request, seed):
    from Bio.Align import MultipleSeqAlignment
    from Bio.Align.AlignInfo import SummaryInfo

    seed_file = os.path.join(settings.STATIC_ROOT_AUX, "browse", "seeds")
    try:
        histone = Histone.objects.get(id=seed)
        seed_file = os.path.join(seed_file, "{}".format(histone.id))
    except Histone.DoesNotExist:
        try:
            variant = Variant.objects.get(id=seed)
            seed_file = os.path.join(seed_file, variant.hist_type.id, "{}".format(variant.id))
            # the default names for canonical are with underscores, so we do not need to convert back. ALEXEY, 30/12/15
            # seed_file = os.path.join(seed_file, variant.hist_type.id, "{}".format(variant.id.replace("canonical", "canonical_")))
        except Variant.DoesNotExist:
            return HttpResponseNotFound('<h1>No histone variant with name {}</h1>'.format(seed))

    download = request.GET.get("download", False) == "true"

    format = request.GET.get("format", "json")

    try:
        limit = int(request.GET.get("limit", 0))
    except ValueError:
        limit = 0

    consensus = request.GET.get("consensus", False)

    if not consensus in ["limit", "all", False]:
        consensus = "all"

    response = HttpResponse(content_type='text')

    if download:
        response['Content-Disposition'] = 'attachment; filename="{}.{}"'.format(seed, format)

    sequences = SeqIO.parse("{}.fasta".format(seed_file), "fasta")

    if consensus:
        sequences = [s for i, s in enumerate(sequences) if consensus == "all" or (consensus == "limit" and i < limit)]
        msa = MultipleSeqAlignment(sequences)
        a = SummaryInfo(msa)
        sequences.insert(0, SeqRecord(id="Consensus", description="", seq=a.dumb_consensus(threshold=0.1, ambiguous='X')))
        limit = limit+1 if limit > 0 else 0

    def limited_seqs():
        for i, seq in enumerate(sequences):
            if not consensus or consensus == "limit" or (limit > 0 and i < limit):
                yield seq

    with open("{}.gff".format(seed_file)) as feature_file:
        features = feature_file.read()

    if format == "fasta":
        SeqIO.write(limited_seqs(), response, "fasta")
    elif format == "gff":
        response.write(features)
    elif format == "pdf":
        with open("{}.pdf".format(seed_file)) as pdf:
            response.write(pdf.read())
    else:
        #Default format is json
        sequences = [{"name":seq.id, "seq":str(seq.seq)} for seq in limited_seqs()]
        result = {"seqs":sequences, "features":features}
        response.write(json.dumps(result))

    return response

def get_sunburst_json(request, parameters=None):
    """
    """
    if parameters and isinstance(parameters, dict):
        query = parameters
    elif request.method == "POST": 
        query = request.POST.copy()
    else:
        query = request.GET.copy()
    
    if query:
        result = HistoneSearch(query)
        sunburst = result.get_sunburst()
        return JsonResponse(sunburst, safe=False)
    else:
        raise Http404("No taxonomy distribution sunburst for query")

def get_type_by_variant(variant):
    bool_dict = {
        'H1' in variant: 'H1',
        'H2A' in variant: 'H2A',
        'H2B' in variant: 'H2B',
        'H3' in variant: 'H3',
        'H4' in variant: 'H4',
    }
    return bool_dict[True]

def get_variants_children(variant_id):
    children_qset = Variant.objects.get(id=variant_id).direct_children
    children = children_qset.annotate(num_sequences=Count('sequences')).order_by(
        "id").all().values_list("id", "num_sequences", "taxonomic_span")
    curated_children = children_qset.filter(Q(sequences__reviewed=True) | Q(sequences__reviewed__isnull=True)).annotate(
        num_sequences=Count('sequences')).order_by("id").all().values_list("num_sequences", flat=True)
    return [{'id': id, 'num_curated': num_curated, 'num_all': num_all,
             'alternate_names': ", ".join(Variant.objects.get(id=id).old_names.values_list("name", flat=True)),
             'tax_span': tax_span, 'color': color,
             'children': get_variants_children(id)} \
            for (id, num_all, tax_span), num_curated, color in zip(children, curated_children, colors)]
