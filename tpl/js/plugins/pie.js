(function() {
    var l = window.AmCharts;
    l.AmPieChart = l.Class({
        inherits: l.AmSlicedChart,
        construct: function(d) {
            this.type = "pie";
            l.AmPieChart.base.construct.call(this, d);
            this.cname = "AmPieChart";
            this.pieBrightnessStep = 30;
            this.minRadius = 10;
            this.depth3D = 0;
            this.startAngle = 90;
            this.angle = this.innerRadius = 0;
            this.startRadius = "500%";
            this.pullOutRadius = "20%";
            this.labelRadius = 20;
            this.labelText = "[[title]]: [[percents]]% ";
            this.balloonText = "[[value]]";
            this.previousScale = 1;
            this.adjustPrecision = !1;
            l.applyTheme(this, d, this.cname)
        },
        drawChart: function() {
            l.AmPieChart.base.drawChart.call(this);
            var d = this.chartData;
            if (l.ifArray(d)) {
                if (0 < this.realWidth && 0 < this.realHeight) {
                    l.VML && (this.startAlpha = 1);
                    var k = this.startDuration,
                        c = this.container,
                        b = this.updateWidth();
                    this.realWidth = b;
                    var m = this.updateHeight();
                    this.realHeight = m;
                    var e = l.toCoordinate,
                        f = e(this.marginLeft, b),
                        a = e(this.marginRight, b),
                        z = e(this.marginTop, m) + this.getTitleHeight(),
                        n = e(this.marginBottom, m),
                        A, B, g, x = l.toNumber(this.labelRadius),
                        p = this.measureMaxLabel();
                    p > this.maxLabelWidth && (p = this.maxLabelWidth);
                    this.labelText && this.labelsEnabled || (x = p = 0);
                    A = void 0 === this.pieX ? (b - f - a) / 2 + f : e(this.pieX, this.realWidth);
                    B = void 0 === this.pieY ? (m - z - n) / 2 + z : e(this.pieY, m);
                    g = e(this.radius, b, m);
                    g || (b = 0 <= x ? b - f - a - 2 * p : b - f - a, m = m - z - n, g = Math.min(b, m), m < b && (g /= 1 - this.angle / 90, g > b && (g = b)), m = l.toCoordinate(this.pullOutRadius, g), g = (0 <= x ? g - 1.8 * (x + m) : g - 1.8 * m) / 2);
                    g < this.minRadius && (g = this.minRadius);
                    m = e(this.pullOutRadius, g);
                    z = l.toCoordinate(this.startRadius, g);
                    e = e(this.innerRadius, g);
                    e >= g && (e = g - 1);
                    n = l.fitToBounds(this.startAngle, 0, 360);
                    0 < this.depth3D && (n = 270 <= n ? 270 : 90);
                    n -= 90;
                    360 < n && (n -= 360);
                    b = g - g * this.angle / 90;
                    for (f = p = 0; f < d.length; f++) a = d[f], !0 !== a.hidden && (p += l.roundTo(a.percents, this.pf.precision));
                    p = l.roundTo(p, this.pf.precision);
                    this.tempPrec = NaN;
                    this.adjustPrecision && 100 != p && (this.tempPrec = this.pf.precision + 1);
                    for (var D, f = 0; f < d.length; f++)
                        if (a = d[f], !0 !== a.hidden && (this.showZeroSlices || 0 !== a.percents)) {
                            var r = 360 * a.percents / 100,
                                p = Math.sin((n + r / 2) / 180 *
                                    Math.PI),
                                C = b / g * -Math.cos((n + r / 2) / 180 * Math.PI),
                                q = this.outlineColor;
                            q || (q = a.color);
                            var v = this.alpha;
                            isNaN(a.alpha) || (v = a.alpha);
                            q = {
                                fill: a.color,
                                stroke: q,
                                "stroke-width": this.outlineThickness,
                                "stroke-opacity": this.outlineAlpha,
                                "fill-opacity": v
                            };
                            a.url && (q.cursor = "pointer");
                            q = l.wedge(c, A, B, n, r, g, b, e, this.depth3D, q, this.gradientRatio, a.pattern, this.path);
                            l.setCN(this, q, "pie-item");
                            l.setCN(this, q.wedge, "pie-slice");
                            l.setCN(this, q, a.className, !0);
                            this.addEventListeners(q, a);
                            a.startAngle = n;
                            d[f].wedge = q;
                            0 < k &&
                                (this.chartCreated || q.setAttr("opacity", this.startAlpha));
                            a.ix = p;
                            a.iy = C;
                            a.wedge = q;
                            a.index = f;
                            a.label = null;
                            v = c.set();
                            if (this.labelsEnabled && this.labelText && a.percents >= this.hideLabelsPercent) {
                                var h = n + r / 2;
                                0 > h && (h += 360);
                                360 < h && (h -= 360);
                                var t = x;
                                isNaN(a.labelRadius) || (t = a.labelRadius, 0 > t && (a.skipTick = !0));
                                var r = A + p * (g + t),
                                    E = B + C * (g + t),
                                    w, u = 0;
                                isNaN(D) && 350 < h && 1 < d.length - f && (D = f - 1 + Math.floor((d.length - f) / 2));
                                if (0 <= t) {
                                    var y;
                                    90 >= h && 0 <= h ? (y = 0, w = "start", u = 8) : 90 <= h && 180 > h ? (y = 1, w = "start", u = 8) : 180 <= h && 270 > h ? (y = 2, w =
                                        "end", u = -8) : 270 <= h && 357 >= h ? (y = 3, w = "end", u = -8) : 357 <= h && (f > D ? (y = 0, w = "start", u = 8) : (y = 3, w = "end", u = -8));
                                    a.labelQuarter = y
                                } else w = "middle";
                                h = this.formatString(this.labelText, a);
                                (t = this.labelFunction) && (h = t(a, h));
                                t = a.labelColor;
                                t || (t = this.color);
                                "" !== h && (h = l.wrappedText(c, h, t, this.fontFamily, this.fontSize, w, !1, this.maxLabelWidth), l.setCN(this, h, "pie-label"), l.setCN(this, h, a.className, !0), h.translate(r + 1.5 * u, E), h.node.style.pointerEvents = "none", a.ty = E, a.textX = r + 1.5 * u, v.push(h), this.axesSet.push(v), a.labelSet = v, a.label = h);
                                a.tx = r;
                                a.tx2 = r + u;
                                a.tx0 = A + p * g;
                                a.ty0 = B + C * g
                            }
                            r = e + (g - e) / 2;
                            a.pulled && (r += this.pullOutRadiusReal);
                            a.balloonX = p * r + A;
                            a.balloonY = C * r + B;
                            a.startX = Math.round(p * z);
                            a.startY = Math.round(C * z);
                            a.pullX = Math.round(p * m);
                            a.pullY = Math.round(C * m);
                            this.graphsSet.push(q);
                            if (0 === a.alpha || 0 < k && !this.chartCreated) q.hide(), v && v.hide();
                            n += 360 * a.percents / 100;
                            360 < n && (n -= 360)
                        }
                    0 < x && this.arrangeLabels();
                    this.pieXReal = A;
                    this.pieYReal = B;
                    this.radiusReal = g;
                    this.innerRadiusReal = e;
                    0 < x && this.drawTicks();
                    this.initialStart();
                    this.setDepths()
                }(d =
                    this.legend) && d.invalidateSize()
            } else this.cleanChart();
            this.dispDUpd()
        },
        setDepths: function() {
            var d = this.chartData,
                k;
            for (k = 0; k < d.length; k++) {
                var c = d[k],
                    b = c.wedge,
                    c = c.startAngle;
                0 <= c && 180 > c ? b.toFront() : 180 <= c && b.toBack()
            }
        },
        arrangeLabels: function() {
            var d = this.chartData,
                k = d.length,
                c, b;
            for (b = k - 1; 0 <= b; b--) c = d[b], 0 !== c.labelQuarter || c.hidden || this.checkOverlapping(b, c, 0, !0, 0);
            for (b = 0; b < k; b++) c = d[b], 1 != c.labelQuarter || c.hidden || this.checkOverlapping(b, c, 1, !1, 0);
            for (b = k - 1; 0 <= b; b--) c = d[b], 2 != c.labelQuarter || c.hidden || this.checkOverlapping(b, c, 2, !0, 0);
            for (b = 0; b < k; b++) c = d[b], 3 != c.labelQuarter || c.hidden || this.checkOverlapping(b, c, 3, !1, 0)
        },
        checkOverlapping: function(d, k, c, b, m) {
            var e, f, a = this.chartData,
                l = a.length,
                n = k.label;
            if (n) {
                if (!0 === b)
                    for (f = d + 1; f < l; f++) a[f].labelQuarter == c && (e = this.checkOverlappingReal(k, a[f], c)) && (f = l);
                else
                    for (f = d - 1; 0 <= f; f--) a[f].labelQuarter == c && (e = this.checkOverlappingReal(k, a[f], c)) && (f = 0);
                !0 === e && 100 > m && isNaN(k.labelRadius) && (e = k.ty + 3 * k.iy, k.ty = e, n.translate(k.textX, e), this.checkOverlapping(d, k, c, b, m + 1))
            }
        },
        checkOverlappingReal: function(d, k, c) {
            var b = !1,
                m = d.label,
                e = k.label;
            d.labelQuarter != c || d.hidden || k.hidden || !e || (m = m.getBBox(), c = {}, c.width = m.width, c.height = m.height, c.y = d.ty, c.x = d.tx, d = e.getBBox(), e = {}, e.width = d.width, e.height = d.height, e.y = k.ty, e.x = k.tx, l.hitTest(c, e) && (b = !0));
            return b
        }
    })
})();