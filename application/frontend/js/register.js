$(document).ready(function(){
    $("input[name=first_name], input[name=middle_name], input[name=last_name]").bind('keyup blur',function(){
        var node = $(this);
        node.val(node.val().replace(/[^a-zA-Z ]/g,'') ); }
    );
    $('#city').html($('<option>', {value: '', text: 'Select a City/Municipality'}));
    loadProvince();
    $('[data-mask]').each(function() {
        var $this = $(this);
        var mask = $this.attr('data-mask') || 'error...', mask_placeholder = $this.attr('data-mask-placeholder') || 'X';
        $this.mask(mask, {
            placeholder : mask_placeholder
        });
    });
    $('#province').change(function(){
        if(this.value.length == 0){
            $('#city').html($('<option>', {value: '', text: 'Select a City/Municipality'}));
        }
        else{
            $('#city').html($('<option>', {value: '', text: 'Select a City/Municipality'}));
            city = municipalities[this.value.toLowerCase().split(' ').join('_')];
            for(i=0; i < city.length; i++){
                var selected = false;
                if(city[i].toLowerCase() == submittedCity){
                    selected = true;
                }
                $('#city').append($('<option>', {value: city[i], text: city[i], selected: selected}));
            }
        }
    });
    if(submitted){
        $("#province").trigger("change");
    }
    $('input[name=first_name]').focus();
});

$("#registerAccountForm").submit(function (){
    $(".form-control").prop("readonly", true);
    $("button.btn-inverse").prop("disabled", true).prepend($("<i>", { class: "fa fa-spin fa-circle-o-notch" }));
});

function loadProvince(){
    $("#province").html($("<option>", { value: "", disabled: "", selected: "", text: "Select a Province"}));
    for(i=0;i<provinces.length;i++){
        var selected = false;
        if(provinces[i].toLowerCase() == submittedProvince){
            selected = true;
        }
        $('#province').append($('<option>', {value: provinces[i], text: provinces[i], selected: selected}));
    }
    $("#province").prop("disabled", false);
}