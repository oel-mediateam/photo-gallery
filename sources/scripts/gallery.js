// Programmer:	Ethan S. Lin
// Program:		Photo Gallery
// Date:		September 19th, 2012
// Copyright:	UWEX-CEOEL (C) 2012

var isPlaying = false; // flag whether the slideshow is playing or not
var transTime;

$(document).ready(function () {

    var isMobile = sniffUA();
	var holders = '';
	
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
            totalImages = IMAGE.length,
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
			
			$('#images').append('<div class="thumb" id="thumb' + (i + 1) + '"><a class="fancybox" data-title-id="title-' + (i + 1) + '" rel="gallery" href="assets/images/' + fileName + '.' + imageType + '"> <img src="assets/thumbs/' + fileName + '.' + imageType + '" width="150" height="80" border="0" alt="' + imageTitle + '" /> </a></div><div id="title-' + (i + 1) + '" class="hidden" rel="popover"><h3>' + imageTitle + '</h3><div>' + imageDesc + '</div>');

        });
			
        // preload the image
        $("#images").preloader();

        // initialize pop over if it is not a mobile device
        if (!isMobile) {

            initPopOver();

        }

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
            /*minWidth: 600,
            minHeight: 320,*/
            autoSize: true,
            autoResize: false,
            aspectRatio: false,
			fitToView: false,
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

                startTimer(isPlaying);

            },
            afterClose: function () {

                isNotPlaying();

            }
        });


        // auto open and play launcher (slideshow)
        $('.openPlay').bind('click', function () {

            currentlyPlaying();

            $.fancybox.open($(".fancybox"), {
                nextMethod: 'resizeIn',
                nextSpeed: 500,
                prevMethod: false,
                autoPlay: true,
                /*minWidth: 600,
                minHeight: 320,*/
                autoSize: true,
                autoResize: false,
                aspectRatio: false,
				fitToView: false,
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

                    startTimer(isPlaying);

                },
                afterClose: function () {

                    isNotPlaying();

                }

            }); // end fancybox open

        }); // end slideshow click

        function addDescription(n, e) {

            var el, id = e.data('title-id'),
                controls;

            if (isPlaying == false) {

                controls = 'Start Slideshow';

            } else {

                controls = 'Stop';

            }

            if (id) {

                el = $('#' + id);

                if (el.length) {

                    n.title = '<div class="controls"><a class="btn playStop" href="javascript:void(0);" onClick="playStop();">' + controls + '</a></div>' + el.html();

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


    // function that sniff the UA of the client
    function sniffUA() {

        var ua = navigator.userAgent, // hold the user agent
            output = $('#gallery footer .device');

        // structure to hold the available user agents
        var checker = {
            ios: ua.match(/(iPhone|iPod|iPad)/),
            blackberry: ua.match(/BlackBerry/),
            android: ua.match(/Android/),
            browser: ua.match(/(Mozilla|Webkit|msie|Opera)/)
        };

        if (checker.android) {

            output.append('an Android device.');

            return true;

        } else if (checker.ios) {

            output.append('an iOS device.');

            return true;

        } else if (checker.blackberry) {

            output.append('a Blackberry device.');

            return true;

        } else if (checker.browser) {

            output.append('a desktop/laptop web browser.');

            return false;

        } else {

            output.append('an unknown device.');

            return true;

        }

    } // end sniffUA function

}); // end document ready function

// function to play or stop slideshow
function playStop() {

    if (isPlaying == false) {

        $(".playStop").html('Stop');

        currentlyPlaying();
        startTimer(isPlaying);

    } else {

        $(".playStop").html('Start Slideshow');

        isNotPlaying();
        startTimer(isPlaying);

    }

    $.fancybox.play();

}

// set is playing to false
function isNotPlaying() {

    isPlaying = false;

}

// set is playing to true
function currentlyPlaying() {

    isPlaying = true;

}

function startTimer(isPlaying) {

    var bar = $('#timer .progress');

    if (isPlaying == true) {

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