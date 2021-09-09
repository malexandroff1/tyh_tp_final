// ==UserScript==
// @name         ScholarSearch
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Google scholar search
// @author       Maximiliano Alexandroff
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM.registerMenuCommand
// @grant        GM.xmlHttpRequest
// @grant        GM.addStyle
// @grant        GM_getResourceURL
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js
// @resource     JQUERYMODALCSS https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css
// ==/UserScript==

(function() {
    'use strict';

    class Modal {
        constructor(id, className) {
            this.id = id
            this.className = className
            this.children = []
        }

        appendChild(htmlElement) {
            this.children.push(htmlElement)
        }

        getId() {
            return this.id
        }

        toHtmlElement() {
            let modal = document.createElement('div')
            modal.setAttribute('id', this.id)
            modal.setAttribute('class', this.className)

            for (let element of this.children) {
                modal.appendChild(element)
            }

            return modal
        }
    }

    class GoogleSearch {
        constructor() {
            this.style = 'div,h3{margin:0;padding:0;border:0;}a:link{color:#1a0dab;text-decoration:none;}a:visited{color:#660099;text-decoration:none;}a:hover{text-decoration:underline;}a:active{color:#d14836;}.gs_pfcs a:focus{outline:none;}.gs_a{color:#006621;}.gs_fl a:link{color:#1a0dab;}.gs_fl a:visited{color:#660099;}.gs_fl a:active{color:#d14836;}.gs_fl{color:#777777;}.gs_ctc{vertical-align:middle;font-size:11px;font-weight:bold;}.gs_ctc{color:#1a0dab;}.gs_ctg2{font-size:13px;font-weight:bold;}.gs_scl:after{content:"";display:table;clear:both;}.gs_oph{display:none;}.gs_r{position:relative;padding:11px 0 10px 0;}.gs_el_sm .gs_r{padding:7px 0 6px 0;}.gs_rt{position:relative;font-weight:normal;font-size:17px;line-height:19px;margin-right:100px;margin-bottom:2px;}.gs_rt a:link,.gs_rt a:link b{color:#1a0dab;}.gs_rt a:visited,.gs_rt a:visited b{color:#660099;}.gs_rt a:active,.gs_rt a:active b{color:#d14836;}.gs_or_ggsm:focus{outline:none;}.gs_ggs{position:relative;z-index:1;float:right;margin-left:24px;min-width:200px;max-width:256px;width:200px;width:calc(100% - 620px);font-size:17px;line-height:19px;}.gs_el_sm .gs_ggs{margin-left:16px;}@media (max-width:699px){.gs_el_sm .gs_ggs{min-width:0;width:182px;}}.gs_or_ggsm a{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;}.gs_ct1{display:inline;}.gs_ct2{display:none;}.gs_ri{max-width:712px;}.gs_ri .gs_fl a{white-space:nowrap;}.gs_ri .gs_fl{font-size:1px;}.gs_ri .gs_fl a{font-size:13px;margin-right:12px;}.gs_ri .gs_fl a:last-child{margin-right:0;}.gs_ri .gs_fl .gs_or_sav,.gs_ri .gs_fl .gs_or_cit,.gs_ri .gs_fl .gs_or_mor{margin:-7px 6px -6px -6px;padding:7px 0 6px 0;border-radius:50%;}.gs_ri .gs_fl .gs_or_sav:hover,.gs_ri .gs_fl .gs_or_cit:hover,.gs_ri .gs_fl .gs_or_mor:hover{background-color:rgba(0,0,0,.05);}.gs_or_svg{position:relative;width:29px;height:16px;vertical-align:text-bottom;fill:none;stroke:#1a0dab;}a:active .gs_or_svg,a .gs_or_svg:active,a .gs_or_svg>*:active{stroke:#dd4b39;}.gs_or_nvi{display:none;}.gs_rs{margin:2px 0;word-wrap:break-word;}.gs_rs b,.gs_rt b{color:#000;}@media print{.gs_ggs,#gs_top .gs_ctc{display:none;}#gs_top .gs_r,#gs_top .gs_ri,#gs_top .gs_rs{font-size:9pt;color:black;position:static;float:none;margin:0;padding:0;width:auto;min-width:0;max-width:none;}#gs_top #gs_bdy a{color:blue;text-decoration:none;}#gs_top .gs_r{margin:1em 0;page-break-inside:avoid;border:0;}#gs_top .gs_rt{font-size:12pt;}#gs_top .gs_a{font-size:9pt;color:green;}#gs_top .gs_fl,#gs_top .gs_fl a{font-size:9pt;}#gs_top .gs_rs br{display:inline;}}'
        }

        search(title) {
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    method: "GET",
                    url: 'https://scholar.google.com.ar/scholar?q='+title,
                    onload: response => {
                        let parser = new DOMParser()
                        let doc = parser.parseFromString(response.responseText, 'text/html')
                        resolve(doc.getElementById('gs_res_ccl_mid').querySelector('div'))
                    },
                    onerror: error => reject(error)
                })
            })
        }

        getStyle() {
            return this.style
        }
    }

    class Augmenter {

        constructor() {
            this.googleSearch = new GoogleSearch()
        }

        createCSSElementFromURL(url) {
            let link = document.createElement('link')
            link.href = url
            link.rel='stylesheet'
            link.type='text/css'
            return link
        }

        addStyles() {
            document.head.appendChild(this.createCSSElementFromURL(GM_getResourceURL('JQUERYMODALCSS')))
            GM.addStyle(this.googleSearch.getStyle())
        }

        async augment(title) {
            const body = document.querySelector('body')
            let result = await this.googleSearch.search(title)
            let modal = document.getElementById('id-modal')

            if (modal) {
              modal.remove()
            }
            this.addStyles()
            modal = new Modal('id-modal', 'modal')
            modal.appendChild(result)
            body.appendChild(modal.toHtmlElement())
            $("#id-modal").modal()
        }
    }

    let augmenter = new Augmenter()
    GM.registerMenuCommand('Scholar Search', () => augmenter.augment(document.getSelection().toString()))
})()