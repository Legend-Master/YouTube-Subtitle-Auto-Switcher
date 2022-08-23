// ==UserScript==
// @name           YouTube Subtitle Auto Switcher
// @namespace      https://github.com/Legend-Master
// @version        0.3
// @author         Tony
// @description    Switch YouTube subtitle to Chinese automatically
// @description:zh 自动切换 YouTube 字幕到中文
// @homepage       https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher
// @icon           https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL      https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/raw/main/auto_yt_subtitle_switcher.user.js
// @downloadURL    https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/raw/main/auto_yt_subtitle_switcher.user.js
// @supportURL     https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/issues
// @match          http://www.youtube.com/*
// @match          https://www.youtube.com/*
// @grant          none
// ==/UserScript==

(function() {
    'use strict'

    // 中文（简体）-> 中文（中国）-> 中文 -> 中文（香港） -> 中文（台湾）
    const LANGUAGE_CODE_PRIORITY = [ 'zh-Hans', 'zh-CN', 'zh', 'zh-HK', 'zh-TW' ]
    const AUTO_TRANSLATE_CODE = LANGUAGE_CODE_PRIORITY[0]

    function getPreferredLanguageCode(captions) {
        if (captions) {
            for (const code of LANGUAGE_CODE_PRIORITY) {
                for (const caption of captions) {
                    if (caption.languageCode === code) {
                        return code
                    }
                }
            }
        }
    }

    function switchCaption(api, autoTranslate) {
        // No languageCode means caption not enabled
        const captionsSetting = api.getOption?.('captions', 'track')
        if (!captionsSetting?.languageCode) {
            return
        }
        const code = getPreferredLanguageCode(api.getOption('captions', 'tracklist'))
        if (code && code !== captionsSetting.languageCode) {
            api.setOption?.('captions', 'track', { languageCode: code })
        }
        if (
            autoTranslate
            && code !== AUTO_TRANSLATE_CODE
            && captionsSetting?.translationLanguage?.languageCode !== AUTO_TRANSLATE_CODE
        ) {
            const translationLanguage = api.getOption('captions', 'translationLanguages')?.find(
                (element) => element.languageCode === AUTO_TRANSLATE_CODE
            )
            if (translationLanguage) {
                api.setOption?.('captions', 'track', {
                    ...captionsSetting,
                    translationLanguage,
                })
            }
        }
        return true
    }

    const hookedButtons = new Set()

    function hookPlayer(player, api) {
        if (!player) {
            return
        }
        if (!api) {
            api = player
        }

        if (api.getOptions?.('captions')) {
            switchCaption(api)
        } else {
            function onApiChange() {
                if (api.getOptions?.('captions')) {
                    switchCaption(api)
                    api.removeEventListener('onApiChange', onApiChange)
                }
            }
            // Known issue: can't auto switch after offline re-online sometimes,
            // onApiChange will not trigger even tho caption module do reloaded
            // I don't know if there's any way to solve this right now
            api.addEventListener('onApiChange', onApiChange)
        }

        const subtitleButtons = player.getElementsByClassName('ytp-subtitles-button')
        for (const button of subtitleButtons) {
            if (hookedButtons.has(button)) {
                continue
            }
            hookedButtons.add(button)
            // Before youtube switch, if has caption and shift is down,
            // do our switch and prevent youtube switch (and our post switch)
            button.addEventListener('click', (event) => {
                if (event.shiftKey) {
                    const hasCaption = switchCaption(api, true)
                    if (hasCaption) {
                        event.stopImmediatePropagation()
                    }
                }
            }, true)
            // After youtube switch, do our switch
            button.addEventListener('click', (event) => {
                switchCaption(api, event.shiftKey)
            })
        }
    }

    const MAIN_PLAYER_ID = 'movie_player'
    // inline-preview-player does not exist until first time user triggers it
    const YT_PLAYER_IDS = [ MAIN_PLAYER_ID, 'c4-player', /* 'inline-preview-player' */ ]

    // Embed videos don't have yt events (at least I don't know)
    // Known issue: can't auto switch embed video's subtitle if they loads another one
    if (window.location.pathname.split('/')[1] === 'embed') {
        hookPlayer(document.getElementById(MAIN_PLAYER_ID))
    } else {
        for (const id of YT_PLAYER_IDS) {
            hookPlayer(document.getElementById(id))
        }
        window.addEventListener('yt-player-updated', (event) => {
            hookPlayer(event.target, event.detail)
        })
    }
})()
