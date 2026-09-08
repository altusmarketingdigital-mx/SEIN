/*--- Pro Version --- */
eael.hooks.addAction("init", "ea", () => {
    const EALoginRegisterPro = function ($scope, $) {
        const $wrap = $scope.find('.eael-login-registration-wrapper');// cache wrapper
        const ajaxEnabled = $wrap.data('is-ajax');
        const widgetId = $wrap.data('widget-id');
        const pageId  = $wrap.data('page-id');
        const redirectToPrev = $wrap.find('[name="redirect_to_prev_page_login"]').val();
        const redirectTo = redirectToPrev ? redirectToPrev : $wrap.data('redirect-to');
        const $loginForm = $wrap.find('#eael-login-form');
        const $lostpasswordForm = $wrap.find('#eael-lostpassword-form');
        const $resetpasswordForm = $wrap.find('#eael-resetpassword-form');
        const recaptchaAvailablePro = (typeof grecaptcha !== 'undefined' && grecaptcha !== null);
        const loginRecaptchaVersionPro = $wrap.data('login-recaptcha-version');
        const registerRecaptchaVersionPro = $wrap.data('register-recaptcha-version');
        const lostpasswordRecaptchaVersionPro = $wrap.data('lostpassword-recaptcha-version');
        const recaptchaSiteKeyV3Pro = $wrap.data('recaptcha-sitekey-v3');

        let isRecaptchaVersion3Pro = false;
        isRecaptchaVersion3Pro = loginRecaptchaVersionPro === 'v3' || registerRecaptchaVersionPro === 'v3' || lostpasswordRecaptchaVersionPro === 'v3';

        window.isLoggedInByFB = false;
        window.isUsingGoogleLogin = false;
        // Google
        const gLoginNodeId = 'eael-google-login-btn-' + widgetId;
        const $gBtn = $loginForm.find('#' + gLoginNodeId);
        // Facebook
        const fLoginNodeId = 'eael-fb-login-btn-' + widgetId;
        const $fBtn = $loginForm.find('#' + fLoginNodeId);

        const $registerFormWrapper = $wrap.find('#eael-register-form-wrapper');
        const $registerForm = $wrap.find('#eael-register-form');

         // Register: Google
         const gRegisterNodeId = 'eael-google-register-btn-' + widgetId;
         const $gBtnRegister = $registerForm.find('#' + gRegisterNodeId);
         // Register: Facebook
         const fRegisterNodeId = 'eael-fb-register-btn-' + widgetId;
         const $fBtnRegister = $registerForm.find('#' + fRegisterNodeId);

        const ajaxAction = {
            name: "action",
            value: 'eael-login-register-form'
        };
        const valid_login_vendors = ['facebook', 'google', 'login'];
        const $passField = $registerForm.find('#form-field-password');
        const psOps = $registerForm.find('.pass-meta-info').data('strength-options');
        const $passNotice = $registerForm.find('.eael-pass-notice');
        const $passMeter = $registerForm.find('.eael-pass-meter');
        const $passHint = $registerForm.find('.eael-pass-hint');
        const $useWeakPass = $registerFormWrapper.attr('data-use-weak-password');
        const $passwordMinLength = $registerFormWrapper.data('password-min-length');
        const $passwordOneUppercase = $registerFormWrapper.attr('data-password-one-uppercase');
        const $passwordOneLowercase = $registerFormWrapper.data('password-one-lowercase');
        const $passwordOneNumber = $registerFormWrapper.data('password-one-number');
        const $passwordOneSpecial = $registerFormWrapper.data('password-one-special');

        const showPassMeta = ($passField.length > 0 && ($passNotice.length > 0 || $passMeter.length > 0 || $passHint.length > 0));
        eael.getToken();
        const sendData = function sendData(form_data, formType) {
            // set the correct form type we are submitting: login or register?
            form_data.push({
                "name": `eael-${formType}-submit`,
                "value": true
            });

            // set dynamic nonce for ajax request

            form_data = form_data.map(function(item){
                if( item.name === 'eael-login-nonce' || item.name === 'eael-register-nonce' || item.name === 'eael-lostpassword-nonce' || item.name === 'eael-resetpassword-nonce' ){
                    item.value = localize.nonce;
                };
                return item;
            });

            form_data.push(ajaxAction);

            if (recaptchaAvailablePro && isRecaptchaVersion3Pro) {
                grecaptcha.ready(function() {
                    grecaptcha.execute(recaptchaSiteKeyV3Pro, { 
                        action: 'eael_login_register_form' 
                    }).then(function (token) {
                        if ($('form input[name="g-recaptcha-response"]', $scope).length === 0) {
                            $('form', $scope).append('<input type="hidden" name="g-recaptcha-response" value="' + token + '">');
                        } else {
                            $('form input[name="g-recaptcha-response"]', $scope).val(token);
                        }
                        const recaptchaV3Token = {
                            name: "g-recaptcha-response",
                            value: token
                        };

                        form_data.push(recaptchaV3Token);

                        eaelAjaxCall(form_data, formType);
                    });
                });
            } else {
                eaelAjaxCall(form_data, formType);
            }
        }

        if ('yes' === ajaxEnabled) {
            //Handle Register form submission via ajax
            $loginForm.unbind().on('submit', function (e) {
                $loginForm.find("#eael-login-submit").prop("disabled",true);
                const form_data = $(this).serializeArray()
                form_data.filter((currentValue, index) => {
                    if (form_data[index].name == 'eael-login-nonce') {
                        form_data[index].value = localize.eael_login_nonce;
                        return;
                    }
                });
                sendData(form_data, 'login');
                return false;
            });

            //Handle Register form submission via ajax
            $registerForm.unbind().on('submit', function (e) {
                $registerForm.find("#eael-register-submit").prop("disabled",true);
                const form_data = $(this).serializeArray()
                form_data.filter((currentValue, index) => {
                    if (form_data[index].name == 'eael-register-nonce') {
                        form_data[index].value = localize.eael_register_nonce;
                    }
                });
                sendData(form_data, 'register');
                return false;
            });

            //Handle Lost Password form submission via ajax
            $lostpasswordForm.on('submit', function (e) {
                $lostpasswordForm.find("#eael-lostpassword-submit").prop("disabled",true);
                const form_data = $(this).serializeArray()
                form_data.filter((currentValue, index) => {
                    if (form_data[index].name == 'eael-lostpassword-nonce') {
                        form_data[index].value = localize.eael_lostpassword_nonce;
                    }
                });
                sendData(form_data, 'lostpassword');
                return false;
            });

            //Handle Reset Password form submission via ajax
            $resetpasswordForm.on('submit', function (e) {
                $resetpasswordForm.find("#eael-resetpassword-submit").prop("disabled",true);
                const form_data = $(this).serializeArray()
                form_data.filter((currentValue, index) => {
                    if (form_data[index].name == 'eael-resetpassword-nonce') {
                        form_data[index].value = localize.eael_resetpassword_nonce;
                    }
                });
                sendData(form_data, 'resetpassword');
                return false;
            });
            
        }

        function eaelAjaxCall(form_data, formType){
            $.ajax({
                url: localize.ajaxurl,
                type: 'POST',
                dataType: 'json',
                data: form_data,
                beforeSend: function () {
                    $wrap.find('.eael-lr-form-loader').show();
                },
                success: function (data) {
                    const success = (data && data.success);
                    const isLoginForm = valid_login_vendors.includes(formType);
                    const isLostpasswordForm = formType === 'lostpassword';
                    const isResetpasswordForm = formType === 'resetpassword';

                    let message;
                    if (success) {
                        message = `<div class="eael-form-msg valid">${data.data.message}</div>`;
                        $loginForm.trigger('reset');
                        $registerForm.trigger('reset');
                        $lostpasswordForm.trigger('reset');
                    } else {
                        if( recaptchaAvailablePro && !isRecaptchaVersion3Pro ){
                            try{
                                grecaptcha.reset(0);
                                grecaptcha.reset(1);
                            }catch( error ){
                                // do nothing
                            }
                        }
                        message = `<div class="eael-form-msg invalid">${data.data}</div>`;
                    }

                    if (isLoginForm) {
                        if(!success){
                            $loginForm.find("#eael-login-submit").prop("disabled",false);
                        }
                        $loginForm.find('.eael-form-validation-container').html(message);
                    } else if ( isLostpasswordForm ) {
                        if(!success){
                            $lostpasswordForm.find("#eael-lostpassword-submit").prop("disabled",false);
                        }
                        $lostpasswordForm.find('.eael-form-validation-container').html(message);
                    } else if ( isResetpasswordForm ) {
                        if(!success){
                            $resetpasswordForm.find("#eael-resetpassword-submit").prop("disabled",false);
                        } else {
                            $resetpasswordForm.find(".eael-lr-form-group").css("display", 'none');
                            $resetpasswordForm.find("#eael-resetpassword-submit").css("display", 'none');
                        }
                        $resetpasswordForm.find('.eael-form-validation-container').html(message);
                    } else {
                        $registerForm.find("#eael-register-submit").prop("disabled",false);
                        $registerForm.find('.eael-form-validation-container').html(message);
                    }

                    //handle redirect
                    if (success) {
                        if (data.data.redirect_to) {
                            setTimeout(() => window.location = data.data.redirect_to, 500);
                        } else if (isLoginForm) {
                            // refresh the page on login success
                            setTimeout(() => location.reload(), 1000);
                        } else if (formType === 'register') {
                            // refresh the page if auto login is added in the register action
                            if (data.data.auto_login) {
                                setTimeout(() => location.reload(), 1000);
                            }
                        }
                    }


                },
                error: function (xhr, err) {
                    let errorHtml = `
                    <p class="eael-form-msg invalid">
                    Error occurred: ${err.toString()} 
                    </p>
                    `;
                    if ('login' === formType) {
                        $loginForm.find("#eael-login-submit").prop("disabled",false);
                        $loginForm.find('.eael-form-validation-container').html(errorHtml);
                    } else if ('lostpassword' === formType) {
                        $lostpasswordForm.find("#eael-lostpassword-submit").prop("disabled",false);
                        $lostpasswordForm.find('.eael-form-validation-container').html(errorHtml);
                    } else if ('resetpassword' === formType) {
                        $resetpasswordForm.find("#eael-resetpassword-submit").prop("disabled",false);
                        $resetpasswordForm.find('.eael-form-validation-container').html(errorHtml);
                    } else {
                        $registerForm.find("#eael-register-submit").prop("disabled",false);
                        $registerForm.find('.eael-form-validation-container').html(errorHtml);
                    }
                },
                complete: function () {
                    $wrap.find('.eael-lr-form-loader').hide();
                }
            });
        }

        const gLoginRegisterClickHandler = function (googleUser) {

            let id_token = googleUser.credential;
            let googleData = [
                {
                    name: 'widget_id',
                    value: widgetId,
                },
                {
                    name: 'page_id',
                    value: pageId,
                },
                {
                    name: 'redirect_to',
                    value: redirectTo,
                },
                {
                    name: 'id_token',
                    value: id_token,
                }, {
                    name: 'nonce',
                    value: $loginForm.find('#eael-login-nonce').val(),
                },
            ];

            sendData(googleData, 'google');

        }

        if (($gBtn.length) || ($gBtnRegister.length)) {
            let gClientId = $gBtn.data('g-client-id'),
                default_form_type = $('.eael-login-form-wrapper', $scope).is(':visible') ? 'login' : 'register',
                type = $gBtn.data('type'),
                theme = $gBtn.data('theme'),
                size = $gBtn.data('size'),
                text = $gBtn.data('text'),
                shape = $gBtn.data('shape'),
                logo_alignment = $gBtn.data('logo_alignment'),
                width = $gBtn.data('width'),
                locale = $gBtn.data('locale'),
                login_btn_trigger = false,
                reg_btn_trigger = false;

            const gisButton = function ($node, $type = 'login') {
                google.accounts.id.renderButton(
                    document.getElementById($node),
                    {
                        type: type,
                        theme: theme,
                        size: size,
                        text: $type === 'register' ? 'signup_with' : text,
                        shape: shape,
                        logo_alignment: logo_alignment,
                        width: width,
                        locale: locale
                    }
                );
            }

            // Login with Google
            if (typeof google !== 'undefined' && google !== null) {
                google.accounts.id.initialize({
                    client_id: gClientId,
                    callback: gLoginRegisterClickHandler
                });

                if ($gBtnRegister.length && default_form_type === 'register') {
                    gisButton(gRegisterNodeId, 'register');
                    $('#eael-lr-login-toggle').on('click', function () {
                        if (!login_btn_trigger) {
                            gisButton(gLoginNodeId);
                            login_btn_trigger = true;
                        }
                    });
                } else if ($gBtnRegister.length && default_form_type === 'login') {
                    gisButton(gLoginNodeId);
                    $('#eael-lr-reg-toggle').on('click', function () {
                        if (!reg_btn_trigger) {
                            gisButton(gRegisterNodeId, 'register');
                            reg_btn_trigger = true;
                        }
                    });
                } else {
                    gisButton(gLoginNodeId);
                }
            }
        }

        const gLoginRegisterClickHandlerError = function (error) {
            let msg = `<p class="eael-form-msg invalid"> Something went wrong! ${error.error}</p>`
            $scope.find('.eael-form-validation-container').html(msg);
        };

        if ( ($fBtn.length && !isEditMode) || ($fBtnRegister.length && !isEditMode) ) {
            let appId = $fBtn.data('fb-appid');
            window.fbAsyncInit = function () {
                FB.init({
                    appId: appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v8.0'
                });

                FB.AppEvents.logPageView();

            };

            (function (d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s);
                js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));


            $fBtn.on('click', function () {

                if (!isLoggedInByFB) {
                    FB.login(function (response) {
                        // handle the response
                        if (response.status === 'connected') {
                            // Logged into our webpage and Facebook.
                            logUserInOurAppUsingFB();
                        }
                    }, {scope: 'public_profile,email'});
                }

            });

            $fBtnRegister.on('click', function () {

                if (!isLoggedInByFB) {
                    FB.login(function (response) {
                        // handle the response
                        if (response.status === 'connected') {
                            // Logged into our webpage and Facebook.
                            logUserInOurAppUsingFB();
                        }
                    }, {scope: 'public_profile,email'});
                }

            });

            // Fetch the user profile data from facebook.
            function logUserInOurAppUsingFB() {
                FB.api('/me', {fields: 'id, name, email'},
                    function (response) {
                        window.isLoggedInByFB = true;
                        let fbData = [
                            {
                                name: 'widget_id',
                                value: widgetId,
                            },
                            {
                                name: 'redirect_to',
                                value: redirectTo,
                            },
                            {
                                name: 'email',
                                value: response.email,
                            },
                            {
                                name: 'full_name',
                                value: response.name,
                            },
                            {
                                name: 'user_id',
                                value: response.id,
                            },
                            {
                                name: 'access_token',
                                value: FB.getAuthResponse()['accessToken'],
                            },
                            {
                                name: 'nonce',
                                value: $loginForm.find('#eael-login-nonce').val(),
                            },
                        ];

                        sendData(fbData, 'facebook');

                    });

            }
        }

        // Password Strength Related meta information
        if (showPassMeta) {
            function showStrengthMeter(strength, password) {
                if (typeof strength === 'undefined') {
                    return;
                }
                
                if ('yes' !== psOps.show_ps_meter) {
                    return;
                }
                if (!password) {
                    $passMeter.hide(300);
                    return;
                }
                $passMeter.show(400);
                const meterValue = 0 === strength ? 1 : strength;
                $passMeter.val(meterValue);
            }

            function showStrengthText(strength, password) {
                if ('yes' !== psOps.show_pass_strength) {
                    return;
                }
                if (!password) {
                    $passNotice.hide(300);
                    return;
                }
                $passNotice.show(400);
                let pText = '';
                const useCustomText = ('custom' === psOps.ps_text_type);
                const cssClasses = 'short bad mismatch good strong';

                switch (strength) {
                    case -1:
                        // do nothing
                        break;
                    case 2:
                        pText = useCustomText ? psOps.ps_text_bad : pwsL10n.bad;
                        $passNotice.html(pText).removeClass(cssClasses).addClass('bad');

                        break;
                    case 3:
                        pText = useCustomText ? psOps.ps_text_good : pwsL10n.good;
                        $passNotice.html(pText).removeClass(cssClasses).addClass('good');
                        break;
                    case 4:
                        pText = useCustomText ? psOps.ps_text_strong : pwsL10n.strong;
                        $passNotice.html(pText).removeClass(cssClasses).addClass('strong');

                        break;
                    case 5:
                        $passNotice.html(pwsL10n.mismatch).removeClass(cssClasses).addClass('mismatch');
                        break;
                    default:
                        pText = useCustomText ? psOps.ps_text_short : pwsL10n.short;
                        $passNotice.html(pText).removeClass(cssClasses).addClass('short');
                }
            }

            function togglePassHint(strength) {
                if (strength >= 3) {
                    $passHint.hide(300); // hide hint when pass word is good.
                } else {
                    $passHint.show(400);
                }
            }

            function checkPassStrength() {
                let strength;
                let password = $passField.val();
                if (password) {
                    strength = wp.passwordStrength.meter(password, wp.passwordStrength.userInputDisallowedList(), password);// @todo; add confirm pass check later
                }
                // recalculate if use weak password is disabled
                if(typeof $useWeakPass !== 'undefined' && $useWeakPass === '0'){
                    strength = 2; // by default password is weak

                    let passwordMinLengthPassed = $passwordMinLength ? password.length >= $passwordMinLength : true;
                    let passwordOneUppercasePassed = $passwordOneUppercase ? password.match(/[A-Z]/) : true;
                    let passwordOneLowercasePassed = $passwordOneLowercase ? password.match(/[a-z]/) : true;
                    let passwordOneNumberPassed = $passwordOneNumber ? password.match(/\d/) : true;
                    let passwordOneSpecialPassed = $passwordOneSpecial ? password.match(/[!@#$%^&*-]/) : true;

                    if(passwordMinLengthPassed && passwordOneUppercasePassed && passwordOneLowercasePassed && passwordOneNumberPassed && passwordOneSpecialPassed){
                        strength = 4; //strong
                    } else {
                        if(passwordMinLengthPassed){
                            strength = 3; //good
                        }
                    }
                }
                
                showStrengthMeter(strength, password)
                showStrengthText(strength, password);
                togglePassHint(strength);
            }

            $passField.on('keyup', function (e) {
                checkPassStrength();
            });
        }

        // Initialize Animated Character
        initAnimatedCharacter();

        function initAnimatedCharacter() {
            const $characterWrapper = $wrap.find('.eael-animated-character-wrapper');
            if ($characterWrapper.length === 0) {
                return;
            }

            const animationSpeed = parseFloat($characterWrapper.data('animation-speed')) || 1.0;
            const eyeTracking = $characterWrapper.data('eye-tracking') === 'yes';
            const passwordCovering = $characterWrapper.data('password-covering') === 'yes';

            // const $characterSvg = $characterWrapper.find('.eael-character-svg');
            const $characterSvg = $characterWrapper.find('.eael-animated-character');
            const $emailField = $loginForm.find('input[name="eael-user-login"]');
            const $passwordField = $loginForm.find('input[name="eael-user-password"]');
            // Try multiple selectors for password toggle
            let $showPasswordToggle = $loginForm.find('.wp-hide-pw');
            if ($showPasswordToggle.length === 0) {
                $showPasswordToggle = $loginForm.find('#wp-hide-pw');
            }
            if ($showPasswordToggle.length === 0) {
                $showPasswordToggle = $loginForm.find('button[aria-label*="password"], button[aria-label*="Password"]');
            }

            if ($characterSvg.length === 0) {
                return;
            }

            if ($emailField.length === 0) {
                return;
            }

            if ($passwordField.length === 0) {
                return;
            }

            // Check if GSAP is available
            if (typeof TweenMax === 'undefined' && typeof gsap === 'undefined') {
                return;
            }

            // Character elements
            const twoFingers = $characterSvg.find('.twoFingers')[0];
            const armL = $characterSvg.find('.armL')[0];
            const armR = $characterSvg.find('.armR')[0];
            const eyeL = $characterSvg.find('.eyeL')[0];
            const eyeR = $characterSvg.find('.eyeR')[0];
            const nose = $characterSvg.find('.nose')[0];
            const mouth = $characterSvg.find('.mouth')[0];
            const chin = $characterSvg.find('.chin')[0];
            const face = $characterSvg.find('.face')[0];
            const eyebrow = $characterSvg.find('.eyebrow')[0];
            const outerEarL = $characterSvg.find('.earL .outerEar')[0];
            const outerEarR = $characterSvg.find('.earR .outerEar')[0];
            const earHairL = $characterSvg.find('.earL .earHair')[0];
            const earHairR = $characterSvg.find('.earR .earHair')[0];
            const hair = $characterSvg.find('.hair')[0];
            const bodyBG = $characterSvg.find('.bodyBGnormal')[0];
            const bodyBGchanged = $characterSvg.find('.bodyBGchanged')[0];



            let activeElement = null;
            let screenCenter = 0;
            let svgCoords = {};
            let emailCoords = {};
            let emailScrollMax = 0;
            let chinMin = 0.5;
            let dFromC = 0;
            let blinking = null;
            let eyeScale = 1;
            let eyesCovered = false;
            let showPasswordClicked = false;

            let eyeLCoords = {}, eyeRCoords = {}, noseCoords = {}, mouthCoords = {};
            let eyeLAngle = 0, eyeLX = 0, eyeLY = 0, eyeRAngle = 0, eyeRX = 0, eyeRY = 0;
            let noseAngle = 0, noseX = 0, noseY = 0, mouthAngle = 0, mouthX = 0, mouthY = 0, mouthR = 0;
            let chinX = 0, chinY = 0, chinS = 0, faceX = 0, faceY = 0, faceSkew = 0, eyebrowSkew = 0;
            let outerEarX = 0, outerEarY = 0, hairX = 0, hairS = 0;

            function getPosition(el) {
                let xPos = 0;
                let yPos = 0;
                while (el) {
                    if (el.tagName === "BODY") {
                        const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                        const yScroll = el.scrollTop || document.documentElement.scrollTop;
                        xPos += (el.offsetLeft - xScroll + el.clientLeft);
                        yPos += (el.offsetTop - yScroll + el.clientTop);
                    } else {
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                    }
                    el = el.offsetParent;
                }
                return {
                    x: xPos,
                    y: yPos
                };
            }

            function getAngle(x1, y1, x2, y2) {
                return Math.atan2(y1 - y2, x1 - x2);
            }

            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }

            function calculateFaceMove(e) {
                const carPos = $emailField[0].selectionEnd || $emailField.val().length;
                const div = document.createElement('div');
                const span = document.createElement('span');
                const copyStyle = getComputedStyle($emailField[0]);
                let caretCoords = {};

                [].forEach.call(copyStyle, function(prop){
                    div.style[prop] = copyStyle[prop];
                });

                div.style.position = 'absolute';
                document.body.appendChild(div);
                div.textContent = $emailField.val().substr(0, carPos);
                span.textContent = $emailField.val().substr(carPos) || '.';
                div.appendChild(span);

                if($emailField[0].scrollWidth <= emailScrollMax) {
                    caretCoords = getPosition(span);
                    dFromC = screenCenter - (caretCoords.x + emailCoords.x);
                    eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
                    eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
                    noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
                    mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
                } else {
                    eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
                    eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
                    noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
                    mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
                }

                eyeLX = Math.cos(eyeLAngle) * 20;
                eyeLY = Math.sin(eyeLAngle) * 10;
                eyeRX = Math.cos(eyeRAngle) * 20;
                eyeRY = Math.sin(eyeRAngle) * 10;
                noseX = Math.cos(noseAngle) * 23;
                noseY = Math.sin(noseAngle) * 10;
                mouthX = Math.cos(mouthAngle) * 23;
                mouthY = Math.sin(mouthAngle) * 10;
                mouthR = Math.cos(mouthAngle) * 6;
                chinX = mouthX * 0.8;
                chinY = mouthY * 0.5;
                chinS = 1 - ((dFromC * 0.15) / 100);

                if(chinS > 1) {
                    chinS = 1 - (chinS - 1);
                    if(chinS < chinMin) {
                        chinS = chinMin;
                    }
                }

                faceX = mouthX * 0.3;
                faceY = mouthY * 0.4;
                faceSkew = Math.cos(mouthAngle) * 5;
                eyebrowSkew = Math.cos(mouthAngle) * 25;
                outerEarX = Math.cos(mouthAngle) * 4;
                outerEarY = Math.cos(mouthAngle) * 5;
                hairX = Math.cos(mouthAngle) * 6;
                hairS = 1.2;

                if (typeof TweenMax !== 'undefined') {
                    const duration = 1 / animationSpeed;
                    TweenMax.to(eyeL, duration, {x: -eyeLX , y: -eyeLY, ease: Expo.easeOut});
                    TweenMax.to(eyeR, duration, {x: -eyeRX , y: -eyeRY, ease: Expo.easeOut});
                    TweenMax.to(nose, duration, {x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: "center center", ease: Expo.easeOut});
                    TweenMax.to(mouth, duration, {x: -mouthX , y: -mouthY, rotation: mouthR, transformOrigin: "center center", ease: Expo.easeOut});
                    TweenMax.to(chin, duration, {x: -chinX, y: -chinY, scaleY: chinS, ease: Expo.easeOut});
                    TweenMax.to(face, duration, {x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: "center top", ease: Expo.easeOut});
                    TweenMax.to(eyebrow, duration, {x: -faceX, y: -faceY, skewX: -eyebrowSkew, transformOrigin: "center top", ease: Expo.easeOut});
                    TweenMax.to(outerEarL, duration, {x: outerEarX, y: -outerEarY, ease: Expo.easeOut});
                    TweenMax.to(outerEarR, duration, {x: outerEarX, y: outerEarY, ease: Expo.easeOut});
                    TweenMax.to(earHairL, duration, {x: -outerEarX, y: -outerEarY, ease: Expo.easeOut});
                    TweenMax.to(earHairR, duration, {x: -outerEarX, y: outerEarY, ease: Expo.easeOut});
                    TweenMax.to(hair, duration, {x: hairX, scaleY: hairS, transformOrigin: "center bottom", ease: Expo.easeOut});
                }

                document.body.removeChild(div);
            }

            function onEmailInput(e) {
                if (eyeTracking) {
                    calculateFaceMove(e);
                }
            }

            function onEmailFocus(e) {
                activeElement = "email";
                if (eyeTracking) {
                    onEmailInput();
                }
            }

            function onEmailBlur(e) {
                activeElement = null;
                setTimeout(function() {
                    if(activeElement === "email") {
                    } else {
                        if (eyeTracking) {
                            resetFace();
                        }
                    }
                }, 100);
            }

            function onPasswordFocus(e) {
                activeElement = "password";
                if(passwordCovering && !eyesCovered) {
                    coverEyes();
                }
            }

            function onPasswordBlur(e) {
                activeElement = null;
                setTimeout(function() {
                    if(activeElement === "toggle" || activeElement === "password") {
                    } else {
                        if (passwordCovering) {
                            uncoverEyes();
                        }
                    }
                }, 100);
            }

            function spreadFingers() {
                if (typeof TweenMax !== 'undefined' && twoFingers) {
                    const duration = 0.35 / animationSpeed;
                    // Only animate fingers if hands are covering eyes, otherwise do nothing
                    if (eyesCovered) {
                        TweenMax.to(twoFingers, duration, {transformOrigin: "bottom left", rotation: 30, x: -9, y: -2, ease: Power2.easeInOut});
                    }
                }
            }

            function closeFingers() {
                if (typeof TweenMax !== 'undefined' && twoFingers) {
                    const duration = 0.35 / animationSpeed;
                    // Only animate fingers if hands are covering eyes, otherwise do nothing
                    if (eyesCovered) {
                        TweenMax.to(twoFingers, duration, {transformOrigin: "bottom left", rotation: 0, x: 0, y: 0, ease: Power2.easeInOut});
                    }
                }
            }

            function coverEyes() {
                if (passwordCovering && typeof TweenMax !== 'undefined') {
                    const duration = 0.45 / animationSpeed;
                    const delay = 0.1 / animationSpeed;
                    TweenMax.killTweensOf([armL, armR]);
                    TweenMax.set([armL, armR], {visibility: "visible"});
                    TweenMax.to(armL, duration, {x: -93, y: 10, rotation: 0, ease: Quad.easeOut});
                    TweenMax.to(armR, duration, {x: -93, y: 10, rotation: 0, ease: Quad.easeOut, delay: delay});
                    if (bodyBGchanged) {
                        TweenMax.to(bodyBG, duration, {morphSVG: bodyBGchanged, ease: Quad.easeOut});
                    }
                    eyesCovered = true;
                }
            }

            function uncoverEyes() {
                if (passwordCovering && typeof TweenMax !== 'undefined') {
                    const duration = 1.35 / animationSpeed;
                    const shortDuration = 0.45 / animationSpeed;
                    const delay = 0.1 / animationSpeed;
                    TweenMax.killTweensOf([armL, armR]);
                    TweenMax.to(armL, duration, {y: 220, ease: Quad.easeOut});
                    TweenMax.to(armL, duration, {rotation: 105, ease: Quad.easeOut, delay: delay});
                    TweenMax.to(armR, duration, {y: 220, ease: Quad.easeOut});
                    TweenMax.to(armR, duration, {rotation: -105, ease: Quad.easeOut, delay: delay, onComplete: function() {
                        TweenMax.set([armL, armR], {visibility: "hidden"});
                    }});
                    TweenMax.to(bodyBG, shortDuration, {morphSVG: bodyBG, ease: Quad.easeOut});
                    eyesCovered = false;
                }
            }

            function resetFace() {
                if (typeof TweenMax !== 'undefined') {
                    const duration = 1 / animationSpeed;
                    TweenMax.to([eyeL, eyeR], duration, {x: 0, y: 0, ease: Expo.easeOut});
                    TweenMax.to(nose, duration, {x: 0, y: 0, scaleX: 1, scaleY: 1, ease: Expo.easeOut});
                    TweenMax.to(mouth, duration, {x: 0, y: 0, rotation: 0, ease: Expo.easeOut});
                    TweenMax.to(chin, duration, {x: 0, y: 0, scaleY: 1, ease: Expo.easeOut});
                    TweenMax.to([face, eyebrow], duration, {x: 0, y: 0, skewX: 0, ease: Expo.easeOut});
                    TweenMax.to([outerEarL, outerEarR, earHairL, earHairR, hair], duration, {x: 0, y: 0, scaleY: 1, ease: Expo.easeOut});
                }
            }

            function startBlinking(delay) {
                if(delay) {
                    delay = getRandomInt(delay);
                } else {
                    delay = 1;
                }
                if (typeof TweenMax !== 'undefined') {
                    const duration = 0.1 / animationSpeed;
                    const adjustedDelay = delay / animationSpeed;
                    blinking = TweenMax.to([eyeL, eyeR], duration, {delay: adjustedDelay, scaleY: 0, yoyo: true, repeat: 1, transformOrigin: "center center", onComplete: function() {
                        startBlinking(12);
                    }});
                }
            }

            function stopBlinking() {
                if (blinking && typeof TweenMax !== 'undefined') {
                    blinking.kill();
                    blinking = null;
                    TweenMax.set([eyeL, eyeR], {scaleY: eyeScale});
                }
            }

            // Initialize character
            svgCoords = getPosition($characterSvg[0]);
            emailCoords = getPosition($emailField[0]);
            screenCenter = svgCoords.x + ($characterSvg.width() / 2);
            eyeLCoords = {x: svgCoords.x + 84, y: svgCoords.y + 76};
            eyeRCoords = {x: svgCoords.x + 113, y: svgCoords.y + 76};
            noseCoords = {x: svgCoords.x + 97, y: svgCoords.y + 81};
            mouthCoords = {x: svgCoords.x + 100, y: svgCoords.y + 100};

            // Event listeners
            // Remove any existing event listeners to prevent duplicates
            $emailField.off('focus.eael-character blur.eael-character input.eael-character');
            $passwordField.off('focus.eael-character blur.eael-character');
            $showPasswordToggle.off('click.eael-character focus.eael-character blur.eael-character');

            // Email field events (only if eye tracking is enabled)
            if (eyeTracking) {
                $emailField.on('focus.eael-character', function(e) {
                    onEmailFocus(e);
                });

                $emailField.on('blur.eael-character', function(e) {
                    onEmailBlur(e);
                });

                $emailField.on('input.eael-character', function(e) {
                    onEmailInput(e);
                });
            }

            // Password field events (only if password covering is enabled)
            if (passwordCovering) {
                $passwordField.on('focus.eael-character', function(e) {
                    onPasswordFocus(e);
                });

                $passwordField.on('blur.eael-character', function(e) {
                    onPasswordBlur(e);
                });
            }

            // Password visibility toggle
            if ($showPasswordToggle.length > 0) {
                $showPasswordToggle.on('click.eael-character', function() {
                    // Set activeElement to prevent uncoverEyes during the toggle
                    activeElement = "toggle";

                    setTimeout(function() {
                        if ($passwordField.attr('type') === 'text') {
                            // Password is now visible, spread fingers to show "peeking"
                            spreadFingers();
                        } else {
                            // Password is now hidden, close fingers
                            closeFingers();
                        }

                        // Reset activeElement after animation, but only if password field is still focused
                        setTimeout(function() {
                            if ($passwordField.is(':focus')) {
                                activeElement = "password";
                            } else {
                                activeElement = null;
                            }
                        }, 50);
                    }, 100);
                });

                // Handle focus/blur on password toggle to maintain proper activeElement state
                $showPasswordToggle.on('focus.eael-character', function() {
                    activeElement = "toggle";
                });

                $showPasswordToggle.on('blur.eael-character', function() {
                    setTimeout(function() {
                        if ($passwordField.is(':focus')) {
                            activeElement = "password";
                        } else {
                            activeElement = null;
                        }
                    }, 50);
                });
            }

            // Initialize GSAP settings
            if (typeof TweenMax !== 'undefined') {
                TweenMax.set(armL, {x: -93, y: 220, rotation: 105, transformOrigin: "top left"});
                TweenMax.set(armR, {x: -93, y: 220, rotation: -105, transformOrigin: "top right"});
                TweenMax.set(mouth, {transformOrigin: "center center"});
                // Hide arms initially
                TweenMax.set([armL, armR], {visibility: "hidden"});
            }

            startBlinking(5);
            emailScrollMax = $emailField[0].scrollWidth;
        }

    };

    if (eael.elementStatusCheck('eaelLoginRegisterPro')) {
        return false;
    }

    elementorFrontend.hooks.addAction("frontend/element_ready/eael-login-register.default", EALoginRegisterPro);
});