/**
 * Created by user on 16/01/17.
 */

jQuery(document).ready(function($) {

    $("#submitForm").click(function (e) {

        var Id = $("#userId").val();
        var Email = $("#userEmail").val();
        var Amount = $("#depositAmount").val();
        if (Id != '' && Email != '') {
            alert('please fill Id or Email');
            return false;
        }

        apiRequest('getCustomer', $('#ccDeposit').serialize(), '#ccDepositFull', function (data) {
            d = data[0];

            $('#merchant_customer_id').val(d.id);
            $('#amount').val(Amount);
            $('#currency').val(d.Currency);
            $('#holder_name').val(d.First_Name + ' ' + d.Last_Name);
            $('#customer_email').val( d.SpotEmail ? d.SpotEmail : d.Email );
            $('#phone').val( d.SpotPhoneNumber ? d.SpotPhoneNumber : d.Phone_Number );
            $('#address').val(d.Street + ' ' + d.House_Number + ' ' + d.Apartment_Number);
            $('#postal_code').val(d.Postal_Code);
            $('#city').val(d.City);

            apiRequest('getCountryByName', {"name": d.Country}, '', function (country) {
                c = country;

                $('#country').val(c.iso);
                $('#phone_prefix').val(c.prefix);
            });

            $('#ccDeposit').hide();
            $('#ccDepositFull').show();

        });

    });

    $("#submitFormFull").click(function (e) {
        apiRequest('getSpotPaymentPage', $('#ccDepositFull').serialize(), '', function (data) {
            $('#ccDepositFull').hide();
            $('#secureDepositIframe').attr('src', data.data.url);
            $('#creditCardForm').removeClass('visibility');
        });
    });

});