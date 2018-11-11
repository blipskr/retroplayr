define(["kick/core/Constants", "kick/scene/Camera", "kick/scene/Transform", "kick/scene/EngineUniforms","kick/scene/MeshRenderer", "kick/math/Mat4", "kick/core/EngineSingleton", "kick/texture/RenderTexture", "kick/core/Util", "kick/material/Material"],
    function (constants, Camera, Transform, EngineUniforms, MeshRenderer, Mat4, EngineSingleton, RenderTexture, Util, Material) {
        "use strict";
        var ASSERT = constants._ASSERT,
            fail = Util.fail;
        /**
         * A helper-class used for rendering.
         *
         * @class Graphics
         * @namespace kick.core
         */
        return {
            /**
             * @method drawQuad
             * @param {kick.material.Material} material
             * @param {kick.math.Vec4} [normalizedViewportRect=[0,0,1,1]]
             * @static
             */
            drawQuad: (function(){
                var camera,
                    engine,
                    engineUniforms,
                    meshRenderer;
                return function(material, normalizedViewportRect){
                    normalizedViewportRect  = normalizedViewportRect || [0,0,1,1];
                    if (!camera){
                        engine = EngineSingleton.engine;
                        camera = new Camera({
                            perspective: false,
                            left:-1,
                            right:1,
                            top:1,
                            bottom:-1,
                            near:-1,
                            far:1
                        });
                        camera.gameObject = {
                            transform: new Transform(),
                            scene: {
                                addEventListener: function(){},
                                findComponentsWithMethod: function(){return [];}
                            }
                        };
                        camera.activated();

                        engineUniforms = new EngineUniforms({
                            viewMatrix:  Mat4.identity(Mat4.create()),
                            projectionMatrix: Mat4.identity(Mat4.create()),
                            viewProjectionMatrix: Mat4.identity(Mat4.create()),
                            lightMatrix: Mat4.identity(Mat4.create()),
                            currentCamera: camera,
                            currentCameraTransform: camera.gameObject.transform
                        });
                        engineUniforms.sceneLights = {};
                        meshRenderer = new MeshRenderer({
                            mesh: engine.project.load(engine.project.ENGINE_MESH_PLANE),
                            material: material
                        });
                        meshRenderer.gameObject = {
                            transform: new Transform()
                        };
                        meshRenderer.activated();
                    }
                    camera.normalizedViewportRect = normalizedViewportRect;
                    camera.setupCamera();
                    meshRenderer.material = material;
                    meshRenderer.render(engineUniforms);
                };
            }()),
            /**
             * @method drawTexture
             * @param {kick.texture.Texture} Texture
             * @param {kick.math.Vec4} [normalizedViewportRect=[0,0,1,1]]
             * @static
             */
            drawTexture: (function(){
                var camera,
                    engine,
                    material,
                    engineUniforms,
                    meshRenderer;
                return function(texture, normalizedViewportRect){
                    normalizedViewportRect  = normalizedViewportRect || [0,0,1,1];
                    if (!camera){
                        engine = EngineSingleton.engine;
                        camera = new Camera({
                            perspective: false,
                            left:-1,
                            right:1,
                            top:1,
                            bottom:-1,
                            near:-1,
                            far:1
                        });
                        camera.gameObject = {
                            transform: new Transform(),
                            scene: {
                                addEventListener: function(){},
                                findComponentsWithMethod: function(){return [];}
                            }
                        };
                        camera.activated();

                        var shader = engine.project.load(engine.project.ENGINE_SHADER_UNLIT);
                        material = new Material({
                            shader: shader,
                            name: "Default material"
                        });

                        engineUniforms = new EngineUniforms({
                            viewMatrix:  Mat4.identity(Mat4.create()),
                            projectionMatrix: Mat4.identity(Mat4.create()),
                            viewProjectionMatrix: Mat4.identity(Mat4.create()),
                            lightMatrix: Mat4.identity(Mat4.create()),
                            currentCamera: camera,
                            currentCameraTransform: camera.gameObject.transform
                        });
                        engineUniforms.sceneLights = {};
                        meshRenderer = new MeshRenderer({
                            mesh: engine.project.load(engine.project.ENGINE_MESH_PLANE),
                            material: material
                        });
                        meshRenderer.gameObject = {
                            transform: new Transform()
                        };
                        meshRenderer.activated();
                    }
                    camera.normalizedViewportRect = normalizedViewportRect;
                    camera.setupCamera();
                    material.setUniform("mainTexture", texture);
                    meshRenderer.material = material;
                    meshRenderer.render(engineUniforms);
                };
            }()),
            /**
             *
             * @example
             *      // render a unlit shader (with color of red) into a texture
             *      texture = new kick.texture.Texture();
             *      texture.setImageData(512, 512, 0, kick.core.Constants.GL_UNSIGNED_BYTE, null, "");
             *      var renderTexture = new kick.texture.RenderTexture({dimension:[512,512], colorTexture: texture});
             *      var shader = engine.project.load(engine.project.ENGINE_SHADER_UNLIT);
             *      var renderMaterial = new kick.material.Material( {
             *          shader:shader,
             *          uniformData: {
             *              mainColor: [1,0,0,1]
             *          }
             *      });
             *      kick.core.Graphics.renderToTexture(renderTexture, renderMaterial);
             * @method renderToTexture
             * @param {kick.texture.RenderTexture} renderTexture
             * @param {kick.material.Material} material
             * @param {kick.math.Vec4} [normalizedViewportRect=[0,0,1,1]]
             * @static
             */
            renderToTexture: (function(){
                var camera,
                    engine,
                    engineUniforms,
                    meshRenderer;
                return function(renderTexture, material, normalizedViewportRect){
                    if (ASSERT){
                        if (!(renderTexture instanceof RenderTexture)){
                            fail("Graphics.renderToTexture: renderTexture must be of type RenderTexture");
                        }
                        if (!(material instanceof Material)){
                            fail("Graphics.renderToTexture: material must be of type Material");
                        }
                    }
                    normalizedViewportRect  = normalizedViewportRect || [0,0,1,1];
                    if (!camera){
                        engine = EngineSingleton.engine;
                        camera = new Camera({
                            perspective: false,
                            left:-1,
                            right:1,
                            top:1,
                            bottom:-1,
                            near:-1,
                            far:1
                        });
                        camera.gameObject = {
                            transform: new Transform(),
                            scene: {
                                addEventListener: function(){},
                                findComponentsWithMethod: function(){return [];}
                            }
                        };
                        camera.activated();

                        engineUniforms = new EngineUniforms({
                            viewMatrix:  Mat4.identity(Mat4.create()),
                            projectionMatrix: Mat4.identity(Mat4.create()),
                            viewProjectionMatrix: Mat4.identity(Mat4.create()),
                            lightMatrix: Mat4.identity(Mat4.create()),
                            currentCamera: camera,
                            currentCameraTransform: camera.gameObject.transform
                        });
                        engineUniforms.sceneLights = {};
                        meshRenderer = new MeshRenderer({
                            mesh: engine.project.load(engine.project.ENGINE_MESH_PLANE)
                        });
                        meshRenderer.gameObject = {
                            transform: new Transform()
                        };
                        meshRenderer.activated();
                    }
                    camera.normalizedViewportRect = normalizedViewportRect;
                    camera.renderTarget = renderTexture;
                    renderTexture.bind();
                    camera.setupCamera();
                    meshRenderer.material = material;
                    meshRenderer.render(engineUniforms);
                    renderTexture.unbind();
                }}())
        }
    });
