/*
 * Photo Gallery
 *
 * @author: Ethan Lin
 * @url: https://github.com/oel-mediateam/photo-gallery
 * @version: 1.0.1
 * Released 9/19/2012
 *
 * @license: GNU GENERAL PUBLIC LICENSE v3
 *
    Storybook Plus is an web application that serves multimedia contents.
    Copyright (C) 2013-2015  Ethan S. Lin, UWEX CEOEL Media Services

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

$(document).ready(function () {

    var isPlaying = false; // flag whether the slideshow is playing or not
    var transTime;

    // AJAX setup
    $.ajaxSetup({

        url: 'assets/gallery.xml', // the path to the XML file
        dataType: 'xml', // the data type of the file
        accepts: 'xml', // the acceptable type of file
        content: 'xml', // the content of the file
        contentType: 'xml; charset="utf-8"', // the type and encoding of the file content
        cache: false // telling the browser to cache (true) or not (false)

    });

    // Encoding and overiding XML data via ajax requesting
    $.ajax({

        type: 'get', // how the ajax should retreive the data
        // before sending the request, override mime type and
        // set request header
        beforeSend: function (xhr) {
            xhr.overrideMimeType("xml; charset=utf-8");
            xhr.setRequestHeader("Accept", "text/xml");
        },
        // if successful, call setup function
        success: function (xml) {
            setupXML(xml);
        },
        // if there is error, call displayError function
        error: function (xhr, exception) {
            displayError(xhr.status, exception);
        }

    });

    // XML Setup function
    function setupXML(xml) {
        var SETUP = $(xml).find('setup'),
            IMAGE = $(xml).find('image'),
            galleryTitle = SETUP.find('galleryTitle').text(),
            galleryDesc = SETUP.find('galleryDescription').text(),
            imageType = (SETUP.find('imgFormat').text().length <= 0) ? 'png' : SETUP.find('imgFormat').text();

        transTime = (SETUP.find('slideDuration').text().length <= 0) ? 6 * 1000 : SETUP.find('slideDuration').text() * 1000;

        // set the gallery title
        $('#gallery .title').html(galleryTitle);

        // set the gallery description
        if (galleryDesc.length > 0) {

            $('#gallery .description').html(galleryDesc);

        }

        // loop through each topic node to get lesson topics

		$('#images').html('');
        IMAGE.each(function (i) {
            var fileName = $(this).attr('fileName');
            var imageTitle = $(this).find('title').text();
            var imageDesc = $(this).find('description').text();

			$('#images').append('<div class="thumb" id="thumb' + (i + 1) + '"><a class="fancybox" data-title-id="title-' + (i + 1) + '" rel="gallery" href="assets/images/' + fileName + '.' + imageType + '"><img src="assets/thumbs/' + fileName + '.' + imageType + '" width="150" height="80" border="0" alt="' + imageTitle + '" /></a></div><div id="title-' + (i + 1) + '" class="hidden" rel="popover"><h3>' + imageTitle + '</h3><div>' + imageDesc + '</div>');

        });

        // preload the image
        $("#images").preloader();

        // initialize popover
        initPopOver();

        // initialize fancybox
        initFancybox();

    } // end setupXML function

    // function to initialize pop-over
    function initPopOver() {

        var totalImages = $('div.thumb').length;

        for (var i = 0; i < totalImages; i++) {

            var popTitle = $('#title-' + (i + 1) + ' h3').html(),
                popContent = $('#title-' + (i + 1) + ' div').html();

            if (popContent.length > 125) {

                popContent = popContent.substring(0, 122) + "...";

            }

            $('#thumb' + (i + 1)).popover({
                placement: 'top',
                trigger: 'hover',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                delay: {
                    show: 500,
                    hide: 0
                },
                title: popTitle,
                content: popContent
            });

        }

    } // end initPopOver function

    function initFancybox() {

        // fancybox transition effect
        (function ($, F) {

            F.transitions.resizeIn = function () {

                var previous = F.previous,
                    current = F.current,
                    startPos = previous.wrap.stop(true).position(),
                    endPos = $.extend({
                        opacity: 1
                    }, current.pos);

                startPos.width = previous.wrap.width();
                startPos.height = previous.wrap.height();

                previous.wrap.stop(true).trigger('onReset').remove();

                delete endPos.position;

                current.inner.hide();

                current.wrap.css(startPos).animate(endPos, {
                    duration: current.nextSpeed,
                    easing: current.nextEasing,
                    step: F.transitions.step,
                    complete: function () {
                        F._afterZoomIn();

                        current.inner.fadeIn("fast");
                    }

                });
            };

        }(jQuery, jQuery.fancybox));

        // individual fancybox image launcher
        $(".fancybox").attr('rel', 'gallery').fancybox({
            nextMethod: 'resizeIn',
            nextSpeed: 500,
            prevMethod: false,
            autoPlay: false,
            autoSize: true,
            autoResize: true,
            aspectRatio: true,
			fitToView: true,
            playSpeed: transTime,
            helpers: {
                title: {
                    type: 'inside'
                },
                overlay: {
                    css: {
                        'background': 'rgba(250, 250, 250, 0.85)'
                    }
                }
            },
            beforeLoad: function () {

                addDescription(this, $(this.element));

            },
            beforeShow: function () {

                $('#timer').hide();

            },
            afterShow: function () {



            },
            afterClose: function () {

                isPlaying = false;

            }

        });

        // auto open and play launcher (slideshow)
        $('.openPlay').bind('click', function () {

            isPlaying = true;

            $.fancybox.open($(".fancybox"), {
                nextMethod: 'resizeIn',
                nextSpeed: 500,
                prevMethod: false,
                autoPlay: true,
                autoSize: true,
                autoResize: true,
                aspectRatio: true,
				fitToView: true,
                playSpeed: transTime,
                helpers: {
                    title: {
                        type: 'inside'
                    },
                    overlay: {
                        css: {
                            'background': 'rgba(250, 250, 250, 0.85)'
                        }
                    }
                },
                beforeLoad: function () {

                    addDescription(this, $(this.element));

                },
                beforeShow: function () {
                    $('#timer').hide();
                },
                afterShow: function () {

                    startTimer();

                },
                afterClose: function () {

                    isPlaying = false;

                }

            }); // end fancybox open

        }); // end slideshow click

        function addDescription(n, e) {

            var el, id = e.data('title-id');

            if (id) {

                el = $('#' + id);

                if (el.length) {

                    n.title = el.html();

                }

            }

        } // end addDecription

    }

    // error handling function
    function displayError(status, exception) {
        var statusMsg, exceptionMsg; // hold status and error message

        // assign status
        if (status === 0) {
            statusMsg = '<strong>Error 0</strong> - Not connect. Please verify network.';
        } else if (status === 404) {
            statusMsg = '<strong>Error 404</strong> - Requested page not found.';
        } else if (status === 406) {
            statusMsg = '<strong>Error 406</strong> - File is not acceptable.';
        } else if (status === 500) {
            statusMsg = '<strong>Error 500</strong> - Internal server error.';
        } else {
            statusMsg = 'Unknow error';
        }

        // assign error
        if (exception === 'parsererror') {
            exceptionMsg = 'Requested XML failed to parse.';
        } else if (exception === 'timeout') {
            exceptionMsg = 'Time out error.';
        } else if (exception === 'abort') {
            exceptionMsg = 'Ajax request aborted.';
        } else if (exception === "error") {
            exceptionMsg = 'HTTP / URL error.';
        } else {
            exceptionMsg = ('Uncaught error:\n' + status.responseText);
        }

        $('.autoOpenPlay').hide();
        $('footer .errorMsg').html(statusMsg + '<br />' + exceptionMsg);

    }

    function startTimer() {

        var bar = $('#timer .progress');

        if (isPlaying === true) {

            $('#timer').show();

            bar.animate({
                width: '100%'
            }, transTime, 'linear', function () {
                $(this).animate({
                    opacity: 0
                }, 1000, function () {
                    $(this).css({
                        'width': '0%',
                        'opacity': '1'
                    });
                });
            });

        } else {

            bar.stop().css({
                'width': '0%',
                'opacity': '1'
            });

            $('#timer').hide();

        }

    }

}); // end document ready function