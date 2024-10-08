import sys
import os
import io
import shlex

import uuid
from Bio import SeqIO, SearchIO
from Bio.Alphabet import IUPAC
from Bio.Blast.Applications import NcbiblastpCommandline
from Bio.Blast import NCBIXML
from Bio import Alphabet
from Bio.Alphabet import IUPAC

from browse.models import Variant, Sequence
from djangophylocore.models import Taxonomy
from django.conf import settings

import subprocess

from django.db.models import Q
from django.db.models import Max, Min, Count

class InvalidFASTA(Exception):
    pass

def process_upload(sequences, format, request):
    if format not in ["file", "text"]:
        raise InvalidFASTA("Invalid format: {}. Must be either 'file' or 'text'.".format(format))

    if format == "text":
        seq_file = io.StringIO()
        seq_file.write(sequences)
        seq_file.seek(0)
        sequences = seq_file
    if format == 'file':
        seq_file = io.StringIO()
        seq_file.write(sequences.read().decode('utf-8'))
        seq_file.seek(0)
        sequences = seq_file
        # sequences = sequences.content_type
        # print(sequences)

    sequences = SeqIO.parse(sequences, "fasta", IUPAC.ExtendedIUPACProtein())

    try:
        sequence = next(sequences)
    except StopIteration:
        raise InvalidFASTA("No sequences parsed.")

    if not Alphabet._verify_alphabet(sequence.seq):
        raise InvalidFASTA("Sequence {} is not a protein.".format(sequence.id))

    result = [str(sequence.id)]

    # classifications, ids, rows = upload_hmmer(sequence)
    # result.append(classifications[0][1])
    # secondary_classification = classifications[0][2]
    # result.append(secondary_classification if secondary_classification != "Unknown" else None)
    # result.append(rows)
    # result.append(upload_blastp(sequence)[0])
    # result.append(result[-1][0]["id"])
    # result.append(result[-2][0]["variant"])
    #
    # request.session["uploaded_sequences"] = [{
    #     "id":"QUERY", #sequence.id,
    #     "variant":classifications[0][1],
    #     "sequence":str(sequence.seq),
    #     "taxonomy":result[-3][0]["taxonomy"]
    # }]

    result.append("depricated")
    secondary_classification = "Unknown"
    result.append(secondary_classification if secondary_classification != "Unknown" else None)
    result.append([])
    result.append(upload_blastp(sequence)[0])
    result.append(result[-1][0]["id"])
    result.append(result[-2][0]["variant"])

    request.session["uploaded_sequences"] = [{
        "id":"QUERY", #sequence.id,
        "variant":"depricated",
        "sequence":str(sequence.seq),
        "taxonomy":result[-3][0]["taxonomy"]
    }]

    return result

def process_upload_blast(sequences, format, request):
    if format not in ["file", "text"]:
        raise InvalidFASTA("Invalid format: {}. Must be either 'file' or 'text'.".format(format))

    if format == "text":
        seq_file = io.StringIO()
        seq_file.write(sequences)
        seq_file.seek(0)
        sequences = seq_file
    if format == 'file':
        seq_file = io.StringIO()
        seq_file.write(sequences.read().decode('utf-8'))
        seq_file.seek(0)
        sequences = seq_file
        # sequences = sequences.content_type
        # print(sequences)

    sequences = SeqIO.parse(sequences, "fasta", IUPAC.ExtendedIUPACProtein())

    try:
        sequence_query = next(sequences)
        sequence_hist = next(sequences)
    except StopIteration:
        raise InvalidFASTA("No sequences parsed.")

    if not Alphabet._verify_alphabet(sequence_query.seq):
        raise InvalidFASTA("Sequence {} is not a protein.".format(sequence_query.id))
    if not Alphabet._verify_alphabet(sequence_hist.seq):
        raise InvalidFASTA("Sequence {} is not a protein.".format(sequence_hist.id))

    sequence_hist_header = str(sequence_hist.id)
    sequence_hist = Sequence.objects.filter(
                        (~Q(variant__id="Unknown") & Q(all_model_scores__used_for_classification=True)) | \
                        (Q(variant__id="Unknown") & Q(all_model_scores__used_for_classification=False)) \
                   ).annotate(
                        num_scores=Count("all_model_scores"),
                        score=Max("all_model_scores__score"),
                        evalue=Min("all_model_scores__evalue")
                   ).get(id=sequence_hist.id.split('|')[1])

    # result = [str(sequence_query.id).replace('|', '_')]
    result = [str(sequence_query.id)]

    result.append([{
                        "id":str(sequence_hist.id),
                        "variant":str(sequence_hist.variant_id),
                        "gene":str(sequence_hist.gene) if sequence_hist.gene else "-",
                        "splice":str(sequence_hist.splice) if sequence_hist.splice else "-",
                        "taxonomy":str(sequence_hist.taxonomy.name.capitalize()),
                        "header":str(sequence_hist.header),
                    }])
    result.append(result[-1][0]["id"])
    result.append(result[-2][0]["variant"])
    result.append(sequence_hist_header)

    request.session["uploaded_sequences"] = [{
        "id":"QUERY", #sequence.id,
        "sequence":str(sequence_query.seq),
        "taxonomy":result[-4][0]["taxonomy"]
    }]

    return result

def process_upload_blast_old(sequences, format, request):
    if format not in ["file", "text"]:
        raise InvalidFASTA("Invalid format: {}. Must be either 'file' or 'text'.".format(format))

    if format == "text":
        seq_file = io.StringIO()
        seq_file.write(sequences)
        seq_file.seek(0)
        sequences = seq_file
    if format == 'file':
        seq_file = io.StringIO()
        seq_file.write(sequences.read().decode('utf-8'))
        seq_file.seek(0)
        sequences = seq_file

    sequences = SeqIO.parse(sequences, "fasta", IUPAC.ExtendedIUPACProtein())

    results = []
    request.session["uploaded_sequences"] = {}
    for sequence in sequences:
        if not Alphabet._verify_alphabet(sequence.seq):
            raise InvalidFASTA("Sequence {} is not a protein.".format(sequence.id))

        result = [str(sequence.id).replace('|', '_')]
        result.append(upload_blastp(sequence)[0])
        result.append(result[-1][0]["id"])
        result.append(result[-2][0]["variant"])
        # print(result[-1])

        results.append(result)

        request.session["uploaded_sequences"][result[-2]+'-'+str(sequence.id).replace('|', '_')] = [{
            "id":"QUERY", #sequence.id,
            "sequence":str(sequence.seq),
            "taxonomy":result[-3][0]["taxonomy"]
        }]

    if len(results) < 1: raise InvalidFASTA("No sequences parsed.")

    # try:
    #     sequence = next(sequences)
    # except StopIteration:
    #     raise InvalidFASTA("No sequences parsed.")
    #
    # if not Alphabet._verify_alphabet(sequence.seq):
    #     raise InvalidFASTA("Sequence {} is not a protein.".format(sequence.id))
    #
    # result = [str(sequence.id)]
    # result.append(upload_blastp(sequence)[0])
    # result.append(result[-1][0]["id"])
    # result.append(result[-2][0]["variant"])
    #
    # request.session["uploaded_sequences"] = [{
    #     "id":"QUERY", #sequence.id,
    #     # "variant":classifications[0][1],
    #     "sequence":str(sequence.seq),
    #     "taxonomy":result[-3][0]["taxonomy"]
    # }]

    return results

def upload_blastp(sequences):
    if not isinstance(sequences, list):
        sequences = [sequences]

    blastp = os.path.join(os.path.dirname(sys.executable), "blastp")
    output= os.path.join("/", "tmp", "{}.xml".format(uuid.uuid4()))
    blastp_cline = NcbiblastpCommandline(
        cmd=blastp,
        db=os.path.join(settings.STATIC_ROOT_AUX, "browse", "blast", "HistoneDB_sequences.fa"), 
        evalue=0.01, outfmt=5)
    out, err = blastp_cline(stdin="\n".join([s.format("fasta") for s in sequences]))
    blastFile = io.StringIO()
    blastFile.write(out)
    blastFile.seek(0)
    
    results = []
    for i, blast_record in enumerate(NCBIXML.parse(blastFile)):
        result = []
        for alignment in blast_record.alignments:
            try:
                gi = alignment.hit_def.split("|")[0]
            except IndexError:
                continue
            for hsp in alignment.hsps:
                sequence = Sequence.objects.filter(
                        (~Q(variant__id="Unknown") & Q(all_model_scores__used_for_classification=True)) | \
                        (Q(variant__id="Unknown") & Q(all_model_scores__used_for_classification=False)) \
                   ).annotate(
                        num_scores=Count("all_model_scores"), 
                        score=Max("all_model_scores__score"),
                        evalue=Min("all_model_scores__evalue")
                   ).get(id=gi)
                search_evalue = hsp.expect
                #We will now append only if the sequences is a cureated one(!)
                # Indeed now it is not needed since the blastdb has only reviewed seqs. but lets keep it for now.
                if(sequence.reviewed==True):
                    result.append({
                        "id":str(sequence.id),
                        "variant":str(sequence.variant_id),
                        "gene":str(sequence.gene) if sequence.gene else "-",
                        "splice":str(sequence.splice) if sequence.splice else "-",
                        "taxonomy":str(sequence.taxonomy.name.capitalize()),
                        "score":str(sequence.score),
                        "evalue":str(sequence.evalue),
                        "header":str(sequence.header),
                        "search_e":str(search_evalue),
                    })
        if not result:
            raise InvalidFASTA("No blast hits for {}.".format(blast_record.query))
        results.append(result)
    if not results:
        raise InvalidFASTA("No blast hits.")

    return results

def upload_hmmer(sequences, evalue=10):
    """
    """
    if not isinstance(sequences, list):
        sequences = [sequences]

    save_dir = os.path.join(os.path.sep, "tmp", "HistoneDB")
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    temp_seq_path = os.path.join(save_dir, "{}.fasta".format(uuid.uuid4()))
    with open(temp_seq_path, "w") as seqs:
        for s in sequences:
            SeqIO.write(s, seqs, "fasta")

    db = os.path.join(settings.STATIC_ROOT_AUX, "browse", "hmms", "combined_hmm.hmm")
    hmmsearch = os.path.join(os.path.dirname(sys.executable), "hmmsearch")
    if not os.path.isdir(hmmsearch):
       hmmsearch = os.path.join("/var/www/hmmer-3.1b2/src", "hmmsearch")

    results = {}

    variants = list(Variant.objects.all().order_by("id").values_list("id", "hmmthreshold"))
    indices = {variant: i for i, (variant, threshold) in enumerate(variants)}
    seqs_index = {seq.id:i for i, seq in enumerate(sequences)}
    ids = [s.id for s in sequences]
    rows = [{} for _ in range(len(variants))]
    classifications = {s.id:"Unknown" for s in sequences}
    secondary_classifications = {s.id:"Unknown" for s in sequences}
    for i, (variant, threshold) in enumerate(variants):
        rows[i]["variant"] = "{} (T:{})".format(variant, round(threshold,1))
        for id in ids:
            rows[i][id] = "n/a"
        rows[i]["data"] = {}
        rows[i]["data"]["above_threshold"] = {id:False for id in ids}
        rows[i]["data"]["this_classified"] = {id:False for id in ids}

    process = subprocess.Popen([hmmsearch, "-E", str(evalue), "--notextw", db, temp_seq_path], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    output, error = process.communicate()
    hmmerFile = io.StringIO()
    hmmerFile.write(output.decode("utf-8"))
    hmmerFile.seek(0)
    for variant_query in SearchIO.parse(hmmerFile, "hmmer3-text"):
        variant = variant_query.id
        # print variant
        try:
            variant_model = Variant.objects.get(id=variant)
        except Variant.DoesNotExist:
            continue

        for hit in variant_query:
            for hsp in hit:
                if hsp.bitscore>=variant_model.hmmthreshold:
                    if (classifications[hit.id] == "Unknown" or float(hsp.bitscore) >= rows[indices[classifications[hit.id]]][hit.id]):
                        if i==1 and not (classifications[hit.id] == "Unknown" in classifications[hit.id]):
                            #Skip canoninical score if already classfied as a variant
                            continue

                        if not classifications[hit.id] == "Unknown":
                            # secondary_classifications[hit.id] = rows[indices[classifications[hit.id]]]["variant"]
                            #I think this line might have been wrong, ALEXEY
                            secondary_classifications[hit.id] = classifications[hit.id]

                        classifications[hit.id] = variant


                        if not classifications[hit.id] == "Unknown":
                            for row in rows:
                                row["data"]["this_classified"][hit.id] = False
                        rows[indices[variant]]["data"]["this_classified"][hit.id] = True
                    else:
                        try:
                            previousScore = rows[indices[secondary_classifications[hit.id]]][hit.id]
                        except KeyError:
                            previousScore = 0
                        if classifications[hit.id] == "Unknown" or float(hsp.bitscore) >= previousScore:
                            secondary_classifications[hit.id] = variant_model.id
                
                rows[indices[variant]]["data"]["above_threshold"][hit.id] = float(hsp.bitscore)>=variant_model.hmmthreshold
                rows[indices[variant]][hit.id] = float(hsp.bitscore)
    
    classifications = [(id, classifications[id], secondary_classifications[id]) for id in ids]

    #Cleanup
    os.remove(temp_seq_path)
    return classifications, ids, rows
