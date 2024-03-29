(function () {
    function p() { var b = document.head.querySelector('link[rel="manifest"]'), a = b ? b.href : ""; if (!a) throw 'can\'t find <link rel="manifest" href=".." />\''; var d = A([a, window.location]), e = new XMLHttpRequest; e.open("GET", a); e.withCredentials = "use-credentials" === b.getAttribute("crossorigin"); e.onload = function () { try { var b = JSON.parse(e.responseText); B(b, d) } catch (k) { console.warn("pwacompat.js error", k) } }; e.send(null) } function A(b) {
        for (var a = {}, d = 0; d < b.length; a = { c: a.c }, ++d) {
        a.c = b[d]; try {
            return new URL("",
                a.c), function (b) { return function (a) { return (new URL(a || "", b.c)).toString() } }(a)
        } catch (e) { }
        } return function (b) { return b || "" }
    } function u(b, a) { b = document.createElement(b); for (var d in a) b.setAttribute(d, a[d]); document.head.appendChild(b); return b } function c(b, a) { a && (!0 === a && (a = "yes"), u("meta", { name: b, content: a })) } function B(b, a) {
        function d(a, d, g) {
            var e = a.width, c = a.height; a = window.devicePixelRatio; var f = v({ width: e * a, height: c * a }); f.scale(a, a); f.fillStyle = b.background_color || "#f8f9fa"; f.fillRect(0, 0, e, c);
            f.translate(e / 2, (c - 32) / 2); g && (c = g.width / a, a = g.height / a, 128 < a && (c /= a / 128, a = 128), 48 <= c && 48 <= a && (f.drawImage(g, c / -2, a / -2, c, a), f.translate(0, a / 2 + 32))); f.fillStyle = t ? "white" : "black"; f.font = "24px HelveticaNeue-CondensedBold"; g = b.name || b.short_name || document.title; a = f.measureText(g).width; if (a < .8 * e) f.fillText(g, a / -2, 0); else for (g = g.split(/\s+/g), a = 1; a <= g.length; ++a) { c = g.slice(0, a).join(" "); var w = f.measureText(c).width; if (a === g.length || w > .6 * e) f.fillText(c, w / -2, 0), f.translate(0, 24 * 1.2), g.splice(0, a), a = 0 } return function () {
                var a =
                    document.createElement("link"); a.setAttribute("rel", "apple-touch-startup-image"); a.setAttribute("media", "(orientation: " + d + ")"); a.setAttribute("href", f.canvas.toDataURL()); return a
            }
        } function e(a) { var b = d(window.screen, "portrait", a), c = d({ width: window.screen.height, height: window.screen.width }, "landscape", a); window.setTimeout(function () { document.head.appendChild(b()); window.setTimeout(function () { document.head.appendChild(c()) }, 10) }, 10) } var h = b.icons || []; h.sort(function (a, b) {
            return parseInt(b.sizes, 10) -
                parseInt(a.sizes, 10)
        }); var k = h.map(function (b) { var d = { rel: "icon", href: a(b.src), sizes: b.sizes }; u("link", d); if (q && !(120 > parseInt(b.sizes, 10))) return d.rel = "apple-touch-icon", u("link", d) }).filter(Boolean); k.length && k[k.length - 1].removeAttribute("sizes"); var m = document.head.querySelector('meta[name="viewport"]'), p = !!(m && m.content || "").match(/\bviewport-fit\s*=\s*cover\b/), r = b.display; m = -1 !== C.indexOf(r); c("mobile-web-app-capable", m); D(b.theme_color || "black", p); E && (c("application-name", b.short_name), c("msapplication-tooltip",
            b.description), c("msapplication-starturl", a(b.start_url || ".")), c("msapplication-navbutton-color", b.theme_color), (h = h[0]) && c("msapplication-TileImage", a(h.src)), c("msapplication-TileColor", b.background_color)); document.head.querySelector('[name="theme-color"]') || c("theme-color", b.theme_color); if (q) {
                var t = x(b.background_color || "#f8f9fa"); (r = F(b.related_applications)) && c("apple-itunes-app", "app-id=" + r); c("apple-mobile-web-app-capable", m); c("apple-mobile-web-app-title", b.short_name || b.name); var n = k[0],
                    l = new Image; l.crossOrigin = "anonymous"; l.onerror = function () { e() }; if (k.length) l.onload = function () { e(l); if (b.background_color) { var a = y(l, b.background_color); a && (n.href = a, k.slice(1).forEach(function (a) { var d = new Image; d.crossOrigin = "anonymous"; d.onload = function () { var c = y(d, b.background_color, !0); a.href = c }; d.src = a.href })) } }, l.src = n.href; else l.onerror()
            } else h = { por: "portrait", lan: "landscape" }[String(b.orientation || "").substr(0, 3)] || "", c("x5-orientation", h), c("screen-orientation", h), "fullscreen" === r ? (c("x5-fullscreen",
                "true"), c("full-screen", "yes")) : m && (c("x5-page-mode", "app"), c("browsermode", "application"))
    } function F(b) { var a; (b || []).filter(function (a) { return "itunes" === a.platform }).forEach(function (b) { b.id ? a = b.id : (b = b.url.match(/id(\d+)/)) && (a = b[1]) }); return a } function D(b, a) {
        if (q || G) {
            var d = x(b); if (q) c("apple-mobile-web-app-status-bar-style", a ? "black-translucent" : d ? "black" : "default"); else {
                a: { try { var e = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar; break a } catch (h) { } e = void 0 } if (a = e) a.foregroundColor =
                    t(d ? "black" : "white"), a.backgroundColor = t(b)
            }
        }
    } function t(b) { b = n(b); return { r: b[0], g: b[1], b: b[2], a: b[3] } } function n(b) { var a = v(); a.fillStyle = b; a.fillRect(0, 0, 1, 1); return a.getImageData(0, 0, 1, 1).data } function x(b) { b = n(b).map(function (a) { a /= 255; return .03928 > a ? a / 12.92 : Math.pow((a + .055) / 1.055, 2.4) }); return 3 < Math.abs(1.05 / (.2126 * b[0] + .7152 * b[1] + .0722 * b[2] + .05)) } function y(b, a, c) {
        c = void 0 === c ? !1 : c; var d = v(b); d.drawImage(b, 0, 0); if (c || 255 != d.getImageData(0, 0, 1, 1).data[3]) return d.globalCompositeOperation =
            "destination-over", d.fillStyle = a, d.fillRect(0, 0, b.width, b.height), d.canvas.toDataURL()
    } function v(b) { b = void 0 === b ? { width: 1, height: 1 } : b; var a = b.height, c = document.createElement("canvas"); c.width = b.width; c.height = a; return c.getContext("2d") } if ("onload" in XMLHttpRequest.prototype && !navigator.f) {
        var C = ["standalone", "fullscreen", "minimal-ui"], z = navigator.userAgent || "", q = navigator.vendor && -1 !== navigator.vendor.indexOf("Apple") && -1 !== z.indexOf("Mobile/"), E = !!z.match(/(MSIE |Edge\/|Trident\/)/), G = "undefined" !==
            typeof Windows; "complete" === document.readyState ? p() : window.addEventListener("load", p)
    }
})();