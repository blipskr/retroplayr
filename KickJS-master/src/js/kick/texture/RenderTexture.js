define(["kick/core/ProjectAsset", "kick/math/Vec2", "kick/core/Constants", "kick/core/Util", "kick/core/EngineSingleton"],
    function (ProjectAsset, Vec2, Constants, Util, EngineSingleton) {
        "use strict";

        /**
         * Render texture (used for camera's render target)
         * @class RenderTexture
         * @namespace kick.texture
         * @constructor
         * @param {Object} [config]
         * @extends kick.core.ProjectAsset
         */
        return function (config) {
            // extend ProjectAsset
            ProjectAsset(this, config, "kick.texture.RenderTexture");
            if (Constants._ASSERT){
                if (config === EngineSingleton.engine){
                    Util.fail("RenderTexture constructor changed - engine parameter is removed");
                }
            }
            var engine = EngineSingleton.engine,
                gl = engine.gl,
                _config = config || {},
                framebuffer = gl.createFramebuffer(),
                colorTexture = null,
                _dimension = Vec2.create(),
                renderBuffers = [],
                thisObj = this,
                _name = "",
                cleanUpRenderBuffers = function () {
                    var i;
                    for (i = 0; i < renderBuffers.length; i++) {
                        gl.deleteRenderbuffer(renderBuffers[i]);
                    }
                },
                initFBO = function () {
                    var renderbuffer,
                        frameBufferStatus;
                    _dimension = colorTexture ? colorTexture.dimension : _dimension;
                    cleanUpRenderBuffers();
                    gl.bindFramebuffer(Constants.GL_FRAMEBUFFER, framebuffer);

                    // bind color attachments
                    if (colorTexture) {
                        gl.framebufferTexture2D(Constants.GL_FRAMEBUFFER, Constants.GL_COLOR_ATTACHMENT0, Constants.GL_TEXTURE_2D, colorTexture.textureId, 0);
                    } else {
                        renderbuffer = gl.createRenderbuffer();
                        gl.bindRenderbuffer(Constants.GL_RENDERBUFFER, renderbuffer);
                        gl.renderbufferStorage(Constants.GL_RENDERBUFFER, Constants.GL_RGBA4, _dimension[0], _dimension[1]);
                        gl.framebufferRenderbuffer(Constants.GL_FRAMEBUFFER, Constants.GL_COLOR_ATTACHMENT0, Constants.GL_RENDERBUFFER, renderbuffer);
                        renderBuffers.push(renderbuffer);
                    }

                    // bind depth attachments
                    renderbuffer = gl.createRenderbuffer();
                    gl.bindRenderbuffer(Constants.GL_RENDERBUFFER, renderbuffer);
                    gl.renderbufferStorage(Constants.GL_RENDERBUFFER, Constants.GL_DEPTH_COMPONENT16, _dimension[0], _dimension[1]);
                    gl.framebufferRenderbuffer(Constants.GL_FRAMEBUFFER, Constants.GL_DEPTH_ATTACHMENT, Constants.GL_RENDERBUFFER, renderbuffer);
                    renderBuffers.push(renderbuffer);

                    if (Constants._ASSERT) {
                        frameBufferStatus = gl.checkFramebufferStatus(Constants.GL_FRAMEBUFFER);
                        if (frameBufferStatus !== Constants.GL_FRAMEBUFFER_COMPLETE) {
                            switch (frameBufferStatus) {
                            case Constants.GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                                Util.fail("FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
                                break;
                            case Constants.GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                                Util.fail("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
                                break;
                            case Constants.GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                                Util.fail("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
                                break;
                            case Constants.GL_FRAMEBUFFER_UNSUPPORTED:
                                Util.fail("FRAMEBUFFER_UNSUPPORTED");
                                break;
                            }
                        }
                    }
                    gl.bindFramebuffer(Constants.GL_FRAMEBUFFER, null);
                },
                contextLost = function () {
                    gl = null;
                },
                contextRestored = function (newGl) {
                    gl = newGl;
                    framebuffer = gl.createFramebuffer();
                    initFBO();
                };

            /**
             * Binds the render texture
             * @method bind
             */
            this.bind = function () {
                gl.bindFramebuffer(Constants.GL_FRAMEBUFFER, framebuffer);
            };

            /**
             * Unbinds the render texture
             * @method unbind
             */
            this.unbind = function () {
                gl.bindFramebuffer(Constants.GL_FRAMEBUFFER, null);
            };


            Object.defineProperties(this, {
                /**
                 * @property dimension
                 * @type kick.math.Vec2
                 */
                dimension: {
                    get: function () {
                        return _dimension;
                    },
                    set: function (newValue) {
                        _dimension = newValue;
                        if (_dimension) {
                            initFBO();
                        }
                    }
                },
                /**
                 * @property colorTexture
                 * @type kick.texture.Texture
                 */
                colorTexture: {
                    get: function () { return colorTexture; },
                    set: function (newValue) {
                        colorTexture = newValue;
                        if (colorTexture) {
                            initFBO();
                        }
                    }
                },
                /**
                 * @property name
                 * @type String
                 */
                name: {
                    get: function () { return _name; },
                    set: function (newValue) { _name = newValue; }
                }
            });

            /**
             * @method destroy
             */
            this.destroy = function () {
                if (framebuffer !== null) {
                    cleanUpRenderBuffers();
                    gl.deleteFramebuffer(framebuffer);
                    framebuffer = null;
                    engine.project.removeResourceDescriptor(thisObj.uid);
                    engine.removeEventListener("contextLost", contextLost);
                    engine.removeEventListener("contextRestored", contextRestored);
                }
            };

            /**
             * @method toJSON
             */
            this.toJSON = function () {
                return {
                    uid: thisObj.uid,
                    name: _name,
                    colorTexture: Util.getJSONReference(colorTexture)
                };
            };

            this.init(config);
            engine.addEventListener('contextLost', contextLost);
            engine.addEventListener('contextRestored', contextRestored);
        };

    });