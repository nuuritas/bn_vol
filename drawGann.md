createRayRectangle(e, t, r) {
                        return this.$chart.chart().createMultipointShape([{
                            price: e,
                            time: 1
                        }, {
                            price: t,
                            time: (new Date).getTime() / 1e3
                        }], {
                            shape: "rectangle",
                            overrides: {
                                backgroundColor: r ? "#56f3ff" : "#ff6076",
                                color: r ? "#56f3ff" : "#ff6076",
                                extendLeft: !0,
                                linewidth: 2,
                                extendRight: !0,
                                backgroundTransparency: .2
                            }
                        })
                    },

drawGann(e) {
                        let t = e[e.length - 1] - e[0]
                          , r = [];
                        for (var i = 1; i < e.length; i++) {
                            var n = e[i - 1]
                              , l = e[i]
                              , o = l - n;
                            0 == (o = o / t * 100) && (n *= 1.002,
                            l *= .998,
                            o = 5),
                            r.push(this.createRayRectangle(n, l, o > 5))
                        }
                        return r
                    },