define(["kick/core/Util", "kick/core/Constants"],
    function (Util, Constants) {
        "use strict";

        var Curve,
            ASSERT = Constants._ASSERT,
            repeat = function(t, length){
                return t - Math.floor(t / length) * length;
            },
            lerpAngle = function(a, b, t){
                var num = repeat(b - a, 360);
                if (num > 180){
                    num -= 360;
                }
                t = Math.max(0,Math.min(1,t));
                return a * num * t;
            };

        /**
         *
         * @class Curve
         * @namespace kick.animation
         * @constructor
         * @param {Config} config defines one or more properties
         */
        Curve = function (config) {
            var controlPoints = [],
                curveType = Curve.NUMBER,
                resArray,
                evaluateTangent = [
                    // number
                    function(value, slope, weight){
                        return value + slope * weight;
                    },
                    // vec2
                    function(value, slope, weight){
                        return [
                            value[0] + slope[0] * weight,
                            value[1] + slope[1] * weight
                        ];
                    },
                    // vec3
                    function(value, slope, weight){
                        return [
                            value[0] + slope[0] * weight,
                            value[1] + slope[1] * weight,
                            value[2] + slope[2] * weight
                        ];
                    },
                    // vec4
                    function(value, slope, weight){
                        return [
                            value[0] + slope[0] * weight,
                            value[1] + slope[1] * weight,
                            value[2] + slope[2] * weight,
                            value[3] + slope[3] * weight
                        ];
                    }/*,
                    // euler
                    function(value, slope, weight){
                        return [
                            value[0] + slope[0] * weight,
                            value[1] + slope[1] * weight,
                            value[2] + slope[2] * weight
                        ];
                    }*/
                ],
                evaluateCurves = [
                    // number
                    function(w1,w2,w3,w4,p1,p2,p3,p4){
                        return w1 * p1 + w2 * p2 + w3 * p3 + w4 * p4;
                    },
                    // vec2
                    function(w1,w2,w3,w4,p1,p2,p3,p4){
                        resArray[0] = w1 * p1[0] + w2 * p2[0] + w3 * p3[0] + w4 * p4[0];
                        resArray[1] = w1 * p1[1] + w2 * p2[1] + w3 * p3[1] + w4 * p4[1];
                        return resArray;
                    },
                    // vec3
                    function(w1,w2,w3,w4,p1,p2,p3,p4){
                        resArray[0] = w1 * p1[0] + w2 * p2[0] + w3 * p3[0] + w4 * p4[0];
                        resArray[1] = w1 * p1[1] + w2 * p2[1] + w3 * p3[1] + w4 * p4[1];
                        resArray[2] = w1 * p1[2] + w2 * p2[2] + w3 * p3[2] + w4 * p4[2];
                        return resArray;
                    },
                    // vec4
                    function(w1,w2,w3,w4,p1,p2,p3,p4){
                        resArray[0] = w1 * p1[0] + w2 * p2[0] + w3 * p3[0] + w4 * p4[0];
                        resArray[1] = w1 * p1[1] + w2 * p2[1] + w3 * p3[1] + w4 * p4[1];
                        resArray[2] = w1 * p1[2] + w2 * p2[2] + w3 * p3[2] + w4 * p4[2];
                        resArray[3] = w1 * p1[3] + w2 * p2[3] + w3 * p3[3] + w4 * p4[3];
                        return resArray;
                    }//,
                    // eulers angels
                    /*function(t,p1,p2,p3,p4){
                        var tmp1,tmp2,tmp3,tmp4,tmp5;

                        tmp1 = [lerpAngle(p1[0], p2[0], t), lerpAngle(p1[1], p2[1], t), lerpAngle(p1[2], p2[2], t)];
                        tmp2 = [lerpAngle(p2[0], p3[0], t), lerpAngle(p2[1], p3[1], t), lerpAngle(p2[2], p3[2], t)];
                        tmp3 = [lerpAngle(p3[0], p4[0], t), lerpAngle(p3[1], p4[1], t), lerpAngle(p3[2], p4[2], t)];

                        tmp4 = [lerpAngle(tmp1[0], tmp2[0], t), lerpAngle(tmp1[1], tmp2[1], t), lerpAngle(tmp1[2], tmp2[2], t)];
                        tmp5 = [lerpAngle(tmp2[0], tmp3[0], t), lerpAngle(tmp2[1], tmp3[1], t), lerpAngle(tmp2[2], tmp3[2], t)];

                        resArray[0] = lerpAngle(tmp4[0], tmp5[0], t);
                        resArray[1] = lerpAngle(tmp4[1], tmp5[1], t);
                        resArray[2] = lerpAngle(tmp4[2], tmp5[2], t);
                        return resArray;
                    }*/
                ],
                currentCurveEvaluation = evaluateCurves[curveType],
                currentEvaluateTangent = evaluateTangent[curveType];

            Object.defineProperties(this, {
                /**
                 * Must be Curve.NUMBER, Curve.VEC2, Curve.VEC3, Curve.EULERS_ANGELS, Curve.VEC4
                 * @property curveType
                 * @type Number
                 */
                curveType: {
                    set: function(newValue){
                        if (curveType === newValue){
                            return;
                        }
                        curveType = newValue;
                        if (curveType === Curve.VEC2){
                            resArray = new Float32Array(2);
                        }
                        if (curveType === Curve.VEC3 || curveType === Curve.EULERS_ANGELS){
                            resArray = new Float32Array(3);
                        }
                        if (curveType === Curve.VEC4){
                            resArray = new Float32Array(4);
                        }

                        if (ASSERT){
                            if (controlPoints.length > 0){
                                Util.warn("Cannot change curvetype when curve is not empty");
                            }
                        }
                        currentCurveEvaluation = evaluateCurves[curveType];
                        currentEvaluateTangent = evaluateTangent[curveType];
                    },
                    get: function(){
                        return curveType;
                    }
                },
                /**
                 * @property startTime
                 * @type Number
                 * @readOnly
                 */
                startTime: {
                    get: function(){
                        return controlPoints[0].time;
                    }
                },
                /**
                 * @property endTime
                 * @type Number
                 * @readOnly
                 */
                endTime: {
                    get: function(){
                        return controlPoints[controlPoints.length-1].time;
                    }
                }
            });

            /**
             * Removes all control points within the curve
             * @method clear
             */
            this.clear = function(){
                controlPoints.length = 0;
            };

            /**
             * @method addControlPoint
             * @param {kick.animation.ControlPoint} controlPoint
             */
            this.addControlPoint = function(controlPoint){
                var i;
                for (i = 0; i < controlPoints.length; i++) {
                    if (controlPoint.time < controlPoints[i]){
                        break;
                    }
                }
                controlPoints.splice(i, 0, controlPoint);
            };

            /**
             * @method evaluate
             * @param time
             * @returns {*}
             */
            this.evaluate = function(time){
                var i,
                    from,
                    to,
                    timeDelta,
                    u,
                    uMinusOne,
                    w1,
                    w2,
                    w3,
                    w4,
                    p0,
                    p1,
                    p2,
                    p3;
                if (time < controlPoints[0].time){
                    return controlPoints[0].time;
                }
                // find two end points
                for (i=1;i < controlPoints.length && controlPoints[i].time<time;i++){
                    // do nothing
                }
                if (i === controlPoints.length) {
                    return controlPoints[i-1].value;
                }
                from = controlPoints[i-1];
                to = controlPoints[i];
                timeDelta = to.time - from.time;
                u = (time - from.time) / timeDelta;
                p0 = from.value;
                p1 = currentEvaluateTangent(from.value,from.outSlope, timeDelta/3);
                p2 = currentEvaluateTangent(to.value,to.inSlope, -timeDelta/3);
                p3 = to.value;
                uMinusOne = 1-u;
                w1 = uMinusOne * uMinusOne * uMinusOne;
                w2 = 3 * u * uMinusOne * uMinusOne;
                w3 = 3 * u * u * uMinusOne;
                w4 = u * u * u;

                return currentCurveEvaluation(w1, w2, w3, w4, p0, p1, p2, p3);
            };
            Util.copyStaticPropertiesToObject(this, Curve);
        };

        /**
         * @property NUMBER
         * @type Number
         * @readOnly
         * @static
         */
        Curve.NUMBER = 0;
        /**
         * @property VEC2
         * @type Number
         * @readOnly
         * @static
         */
        Curve.VEC2 = 1;
        /**
         * @property VEC3
         * @type Number
         * @readOnly
         * @static
         */
        Curve.VEC3 = 2;
        /**
         * @property VEC4
         * @type Number
         * @readOnly
         * @static
         */
        Curve.VEC4 = 3;
//        Curve.EULERS_ANGELS = 4;

        return Curve;
    }
);