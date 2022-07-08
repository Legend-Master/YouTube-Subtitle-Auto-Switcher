// ==UserScript==
// @name           YouTube Subtitle Auto Switcher
// @namespace      https://github.com/Legend-Master
// @version        0.1
// @author         Tony
// @description    Switch YouTube subtitle to Chinese automatically
// @description:zh 自动切换 YouTube 字幕到中文
// @homepage       https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher
// @icon           https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL      https://raw.githubusercontent.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/main/auto_yt_subtitle_switcher.js
// @downloadURL    https://raw.githubusercontent.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/main/auto_yt_subtitle_switcher.js
// @supportURL     https://github.com/Legend-Master/YouTube-Subtitle-Auto-Switcher/issues
// @match          http://www.youtube.com/*
// @match          https://www.youtube.com/*
// @grant          none
// ==/UserScript==

(function() {
    'use strict'

    // 中文（简体）-> 中文（中国）-> 中文 -> 中文（香港） -> 中文（台湾）
    const LANGUAGE_CODE_PRIORITY = [ 'zh-Hans', 'zh-CN', 'zh', 'zh-HK', 'zh-TW' ]

    function getBestLanguageCode(captions) {
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

    let player

    function changeCaptionLanguage() {
        // No languageCode means caption not enabled
        const captionsSetting = player.getOption?.('captions', 'track')
        if (!captionsSetting?.languageCode) {
            return
        }
        const code = getBestLanguageCode(player.getOption('captions', 'tracklist'))
        if (code && code !== captionsSetting.languageCode) {
            player.setOption?.('captions', 'track', { languageCode: code })
        }
    }

    function hookPlayer() {
        const newPlayer = document.getElementById('movie_player') || document.getElementById('c4-player')
        if (player !== newPlayer) {
            player = newPlayer
        }
        if (!player) {
            return
        }

        const subtitleButtons = player.getElementsByClassName('ytp-subtitles-button ytp-button')
        for (const button of subtitleButtons) {
            button.addEventListener('click', changeCaptionLanguage)
        }

        changeCaptionLanguage()
    }

    window.addEventListener('load', hookPlayer)
    window.addEventListener('yt-page-data-updated', hookPlayer)
})()
