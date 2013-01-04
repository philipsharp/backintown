$(function(){
    
    var zipCodeRegexp = /^\d{5}$/;
    
    function loadTeams() {
        _api(
            'performers',
            {
                type: 'mlb',
                per_page: 99
            },
            function(data){
                var teams = _.sortBy(data.performers, 'name'),
                    teamSelector = $('#search-team').empty().append('<option>');
                    _.each(teams, function(el, idx, list) {
                        var option = $('<option></option>').attr('value', el.id).text(el.name);
                        teamSelector.append(option);
                    });
                
            }
        );
    }
    
    function findEvents() {
        var tbl = $('table').hide(),
            team = $('#search-team option:selected').val()
            zip = $('#search-zip').val();
        
        if (team == "" || !zipCodeRegexp.test(zip)) {
            $('#message').removeClass().addClass('alert alert-error').text('Please select a team and enter a valid ZIP code.').show();
        } else {
            _api(
                'events',
                {
                    geoip: zip,
                    range: $('#search-distance').val() + $('#search-unit').val(),
                    'performers.id': team,
                    per_page: 365
                },
                function(data) {
                    var tbody = $('table tbody').empty();
                    if (data.meta.total == 0) {
                        $('#message').removeClass().addClass('alert').text('No games found.').show();
                    } else {
                        $('#message').hide();
                        _.each(data.events, function(el, idx, list) {
                            tbody.append(_makeEventRow(el));
                        });
                        tbl.show();
                    }
                }
            );
        }
    }
    
    function _makeEventRow(event) {
        var date = new Date(Date.parse(event.datetime_local));
        
        return "<tr>" +
        "<td>" + date.toString("ddd, MMM d, yyyy") + "<br>" + date.toString("h:mm tt") + "</td>" +
            "<td><strong>" + event.title + "</strong><br><em><a href=\"https://maps.google.com/?q=" + event.venue.location.lat + "," + event.venue.location.lon + "\" target=\"_blank\">" + event.venue.name + "</a></em><br>" + event.venue.city + ", " + event.venue.state + "</td>" +
            "<td><a href=\"" + event.url + "\" target=\"_blank\">Buy</a></td>" +
            "</tr>";
    }
    
    function _api(resource, params, successCallback, errorCallback) {
        params = params || {};
        successCallback = successCallback || function(){};
        errorCallback = errorCallback || function(){};
        
        var url = "http://api.seatgeek.com/2/" + resource;
        
        $.ajax(
            url,
            {
                cache: true,
                data: params,
                dataType: 'jsonp',
                error: function(xhr, status, error) {
                    errorCallback();
                },
                success: function(data, status, xhr) {
                    successCallback(data);
                }
            }
        );
    }
    
    // onload
    $('form').submit(function(e){
        e.preventDefault();
        findEvents();
    });
    loadTeams();
});