/* global $,_,vg,d3, vis */
'use strict';

(function(vg, $, _) {
    function parse(spec) {
        /* vg.debug.enable=true; */
        vg.embed('#vis', spec, function(error, vis) {
            window.vis = vis;
            if (error) {
                console.error(error);
            }
            $('#spinner').hide();
            vis.view.on('click', function() {
                var what = vis.view.signal('clickStory');
                if (typeof (what.story) !== 'undefined') {
                    var data = vis.view.data().story[0];
                    if (typeof (data) !== 'undefined') {
                        data.perc = d3.format('0%');
                        var titles = {};
                        _.forEach(data.values, function(o) {
                                var ititle = o.title.replace(/[^a-zA-Z ]/g, '').replace(/^ +/, '').replace(/ +$/, '');
                                if (!(ititle in titles)) {
                                    titles[ititle] = { t: o.title, n: 0, m: [] };
                                }
                                titles[ititle].n += 1;
                                titles[ititle].m.push(o.publication_name);
                        });
                        data.titles = _.values(titles);
                        $('#detail .modal-content').html(window.detailTemplate(data));
                        $('#detail').modal();
                        vis.view.signal('clickStory', {});
                    }
                }
            });
        });
    }

    $(window).on('hashchange', function() {
        var h = location.hash;
        if (typeof window.vegaspec !== 'undefined') {
            $('#spinner').show();
            window.vegaspec.spec.data[0].url = 'data/'+h.substr(1)+'.csv';
            parse(window.vegaspec);
        }
        $('#datemenu li').removeClass('active');
        $('#datement li a[href="' + h + '"]').addClass('active');
        $('#datemenu input').remove();
        $('input').appendTo('#datemenu');
        $('input').css('visibility', 'visible');
    });


    $(window).ready(function() {
        _.forEach($('script[type="text/html"]'), function(t) {
            var $t = $(t);
            window[$t.attr('id')] = _.template($t.html());
        });
        var now = new Date();
        var tfmt = d3.time.format('#%Y-%m-%d');
        var lfmt = d3.time.format('Datum: %d.%m.');
        var menu = [];
        _.forEach([1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15], function(d) {
            var pit = new Date(new Date() - d * (24 * 60 * 60 * 1000));
            menu.push({
                'link': tfmt(pit),
                'label': lfmt(pit)
            });
        });
        // menu[0].label = 'Heute';
        // menu[1].label = 'Gestern';
        $('#datemenu').html(window.menuTemplate({
            'items': menu
        }));
        $('#datemenu').append('<li class="divider" role="separator"></li><div class="label_search">SUCHE</div> ');
        location.hash = menu[0].link;
        $.ajax('specs/oaw.json', {
            'success': function(data) {
                window.vegaspec = data;
                $(window).trigger('hashchange');
            }
        });
        $('[data-target="#about"]').on('click', function() {
            var vorlage = 'online-monitoring ' + vis.view.data('meta').values()[0].date + '\n\n';
            var nowr = vis.view.signal('clickRessort');
            var perc = d3.format('0%');
            _.forIn({ pl: 'Politik', wi: 'Wirtschaft', vm: 'Vermischtes', sp: 'Sport', ku: 'Kultur'}, function(v, k) {
                vis.view.signal('clickRessort', { ressort: k });
                vis.view.update();
                vorlage = vorlage + '== ' + v + '\n';
                _.forEach(_.slice(vis.view.data('top10').values(), 0, 3), function(o) {
                    vorlage = vorlage + o.rrank + '. ' + o.title + ' [' + o.rank + '. ' + o.count_ratio + 'x ' + perc(o.mean_ratio) + ']\n';
                });
                vorlage = vorlage + '\n';
            });
            vorlage = vorlage + 'Mehr Statistiken: ' + document.location.href;
            vis.view.signal('clickRessort', nowr );
            vis.view.update();
            $('#copyandpaste').val(vorlage);
        });
        $.ajax('outoforder.html', {
            'success': function(data) {
                $('#outoforder .modal-content').html(data);
                $('#outoforder').modal('show');
            }
        });
        setInterval(function() {
            var h = location.hash;
            if (h.indexOf(menu[0].link) === 0) {
                $(window).trigger('hashchange');
            }
        }, 1000 * 60 * 5);
    });
})(vg, $, _);
