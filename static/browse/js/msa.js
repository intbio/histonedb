function createMSA(div_id, url, download_url, width, height, show_logo){
  var $pdf_button = $('#msa_export_pdf_'+div_id)
      $fasta_button = $('#msa_export_fasta_'+div_id),
      $gff_button = $('#msa_export_features_'+div_id);

  $pdf_button.parent().addClass("disabled");
  $fasta_button.parent().addClass("disabled");
  $gff_button.parent().addClass("disabled");

  var yourDiv = document.getElementById(div_id);
  yourDiv.innerHTML = "<div id='"+div_id+"load_msa'>Please wait while we construct the MSA...</div>";

  /* global yourDiv */
  var msa = require("msa");
  var fasta = require("biojs-io-fasta");
  var gff = require("biojs-io-gff");

  var msaDiv = document.createElement('div');
  yourDiv.appendChild(msaDiv);

  var opts = {
    el: msaDiv
  }
  opts.conf = {
    manualRendering: true
  }
  opts.vis = {
    sequences: true,
    conserv: false,
    overviewbox: false,
    seqlogo: show_logo,
    markers: true,
    leftHeader: false,
    labelName: true,
    labelId: false,
    labelPartition: false,
    labelCheckbox: false,
  };
  opts.zoomer = {
    labelNameLength: 160,
    alignmentWidth: width,
    
  };
  if(height > 0){
    opts.zoomer.alignmentHeight = height;
  }

  var m = msa(opts);

  var arginines = [];

  var colorConservation = {}

  // the init function is only called once
  colorConservation.init = function(){
    // you have here access to the conservation or the sequence object
    this.cons = this.opt.conservation();
  }

  colorConservation.run = function(letter,opts){
    if(arginines.indexOf(opts.pos) > -1){
      return "green";
    }
    else if(this.cons[opts.pos] > 0.8){
      return "red";
    }
    else if(this.cons[opts.pos] > 0.5){
      return "blue";
    }
    else{
      return "#000";
    }
  };

  m.g.colorscheme.addDynScheme("colorConservation", colorConservation);
  m.g.colorscheme.set("scheme", "colorConservation");

  // init msa
  $.ajax({
    url:url,
    dataType: "json",
    success: function(result) {
      m.seqs.reset(result.seqs);
      var features = gff.parseSeqs(result.features);
      if(features.seqs.Consensus != undefined){
        for (var i = features.seqs.Consensus.length-1; i>=0; i--) {
          var feature = features.seqs.Consensus[i];
          if(feature.attributes.Name.lastIndexOf("Minor Groove", 0) === 0){
            arginines.push(feature.start);
            features.seqs.Consensus.splice(i, 1);
          }
        }
      }
      m.seqs.addFeatures(features);
      $("#"+div_id+"load_msa").html("");
      m.render();
      $pdf_button.parent().removeClass("disabled");
      $fasta_button.parent().removeClass("disabled");
      $gff_button.parent().removeClass("disabled");

      if(show_logo){
        $('html, body').animate({
              scrollTop: $("#"+div_id).offset().top
            }, 300, function(){
              // when done, add hash to url
              // (default click behaviour)
              window.location.hash = "#"+div_id;
            });
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus);
      console.log(errorThrown)
    }
  });

  $pdf_button.click(function() {
    if($(this).parent().hasClass(".disabled")){ return; }
    document.location.href = download_url+"&format=pdf";
  });

  $fasta_button.click(function() {
    if($(this).parent().hasClass(".disabled")){ return; }
    document.location.href = download_url+"&format=fasta";
  });

  $gff_button.click(function() {
    if($(this).parent().hasClass(".disabled")){ return; }
    document.location.href = download_url+"&format=gff";
  });
}