"use strict";

const STATE = {
    IDLE: 1,
    RUN: 2,
    ATTACK: 3,
    ATTACKFIRE: 4,
    MOVE2ATTACK: 5,
    BUILDING: 6,
    SELLING: 7,
    MOVE: 8,
    DEFENSE: 9,
    DEFENSEFIRE: 10,
    DELETE: 11,
    MOVE2DEFENSE: 12,
    FIX: 13,
    ATTACK_FIX: 14,
    CHANGE2FIX: 15,
    CHANGE2NORMAL: 16,
    TAKEOFF: 17,
    TAKEDOWN: 18,
    FAILDOWN: 19,
    tostring: function (state) {
        for (var i in STATE)
            if (STATE[i] == state)
                return i;
    }
};

const STATE_PLUS = {
    WAIT2WORK: 1,
    MOVE2WORKPOINT: 2,
    MOVE2HOMEPOINT: 3,
    HOMEPENDING: 4,
    WORKPENDING: 5,
    FINDHEAPMINE: 6,
    IDLE: 7,

    tostring: function (state) {
        for (var i in STATE_PLUS)
            if (STATE_PLUS[i] == state)
                return i;
    }
};



const KEYBOARD = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    KEY_0: 48,
    KEY_1: 49,
    KEY_2: 50,
    KEY_3: 51,
    KEY_4: 52,
    KEY_5: 53,
    KEY_6: 54,
    KEY_7: 55,
    KEY_8: 56,
    KEY_9: 57,
    KEY_A: 65,
    KEY_B: 66,
    KEY_C: 67,
    KEY_D: 68,
    KEY_E: 69,
    KEY_F: 70,
    KEY_G: 71,
    KEY_H: 72,
    KEY_I: 73,
    KEY_J: 74,
    KEY_K: 75,
    KEY_L: 76,
    KEY_M: 77,
    KEY_N: 78,
    KEY_O: 79,
    KEY_P: 80,
    KEY_Q: 81,
    KEY_R: 82,
    KEY_S: 83,
    KEY_T: 84,
    KEY_U: 85,
    KEY_V: 86,
    KEY_W: 87,
    KEY_X: 88,
    KEY_Y: 89,
    KEY_Z: 90,
    LEFT_META: 91,
    RIGHT_META: 92,
    SELECT: 93,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106,
    ADD: 107,
    SUBTRACT: 109,
    DECIMAL: 110,
    DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMICOLON: 186,
    EQUALS: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_BRACKET: 221,
    SINGLE_QUOTE: 222
};


function random() {
    return "?r=" + Math.random();
}



const ____coeff_1 = Math.PI / 4;
const ____coeff_2 = ____coeff_1 * 3;
function myAtan(y, x) {
    var abs_y = y > 0 ? y : -y;
    var angle, r;
    if (x >= 0) {
        r = (x - abs_y) / (x + abs_y);
        angle = ____coeff_1 - ____coeff_1 * r;
    } else {
        r = (x + abs_y) / (abs_y - x);
        angle = ____coeff_2 - ____coeff_1 * r;
    }
    return (y < 0 ? -angle : angle) || 0;
}


function mySin(x) {
    x = (x + 53.4070751) % 6.2831853 - 3.1415927;
    if (x < 0)
        return 1.27323954 * x + .405284735 * x * x;
    else
        return 1.27323954 * x - 0.405284735 * x * x;

}


function myCos(x) {
    x = (x + 54.97787143) % 6.2831853 - 3.1415927;
    if (x < 0)
        return 1.27323954 * x + 0.405284735 * x * x
    else
        return 1.27323954 * x - 0.405284735 * x * x;
}


function check_point_inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};



function reverseArray(array) {
    var result = [];
    for (var i = array.length - 1; i >= 0; i -= 1)
        result.push(array[i]);
    return result;
}

String.prototype.replaceAll = function (search, replace, ignoreCase) {
    if (ignoreCase) {
        var result = [];
        var _string = this.toLowerCase();
        var _search = search.toLowerCase();
        var start = 0, match, length = _search.length;
        while ((match = _string.indexOf(_search, start)) >= 0) {
            result.push(this.slice(start, match));
            start = match + length;
        }
        result.push(this.slice(start));
    } else {
        result = this.split(search);
    }
    return result.join(replace);
}



class TeamColorFilter extends PIXI.AbstractFilter {
    constructor(r, g, b) {
        var vertexShader = null;
        var fragmentShader = [
          'precision mediump float;',
          'varying vec2 vTextureCoord;',
          'uniform sampler2D uSampler;',
          'uniform float r,g,b;',
          'void main(void)',
          '{',
          '    vec4 pixel = texture2D(uSampler, vTextureCoord);',
               'if (pixel.g < 0.02 && pixel.b < 0.02 && pixel.r >  0.01) {',
               '    pixel.b = pixel.r * b ;',
               '    pixel.g = pixel.r * g ;',
               '    pixel.r = pixel.r * r ;',
               '}',
          '    gl_FragColor = pixel;',
          '}'
        ].join('\n');
        var uniforms = {
            r: { type: '1f', value: r / 255 },
            g: { type: '1f', value: g / 255 },
            b: { type: '1f', value: b / 255 },
        };
        super(vertexShader, fragmentShader, uniforms);
    }

};



class GlowFilter extends PIXI.AbstractFilter {
    constructor() {
        var vertexShader = [
            'attribute vec2 aVertexPosition; ',
            'attribute vec2 aTextureCoord;  ',
            ' ',
            'uniform mat3 projectionMatrix; ',
            'uniform float w; ',
            'uniform float h; ',
            ' ',
            'varying vec2 vTextureCoord;  ',
            'varying vec2 vBlurTexCoords[8];  ',
            ' ',
            'void main(void)  ',
            '{  ',
            '     gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);  ',
            '     vTextureCoord = aTextureCoord; ',
            '    ',
            '     vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.7 * w , 0.7  * h); ',
            '     vBlurTexCoords[ 1] = aTextureCoord + vec2(-1.0 * w , 0.000   ); ',
            '     vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.7 * w ,-0.7  * h); ',
            '     vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.000   ,-1.0  * h); ',
            '     vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.7 * w ,-0.7  * h); ',
            '     vBlurTexCoords[ 5] = aTextureCoord + vec2( 1.0 * w , 0.000   ); ',
            '     vBlurTexCoords[ 6] = aTextureCoord + vec2( 0.7 * w , 0.7  * h); ',
            '     vBlurTexCoords[ 7] = aTextureCoord + vec2( 0.000   , 1.0  * h); ',
            '    ',
            '}  ',
        ].join('\n');
        var fragmentShader = [
            'precision lowp float; ',
            '     ',
            'varying vec2 vTextureCoord; ',
            'varying vec2 vBlurTexCoords[8]; ',
            '     ',
            'uniform sampler2D uSampler; ',
            '     ',
            'void main(void) ',
            '{    ',
            '    gl_FragColor = texture2D(uSampler, vTextureCoord ) * 2.00; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[0])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[1])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[2])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[3])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[4])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[5])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[6])*0.25; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[7])*0.25; ',
            '}       ',
        ].join('\n');
        var uniforms = {
            w: { type: '1f', value: 3 / display_width },
            h: { type: '1f', value: 3 / display_height }
        };
        super(vertexShader, fragmentShader, uniforms);

    }
    applyFilter(renderer, input, output, clear) {
        this.uniforms.w.value = 3 / display_width;
        this.uniforms.h.value = 3 / display_height;
        super.applyFilter(renderer, input, output, clear);
    }
};


class GlowFilter2 extends PIXI.AbstractFilter {
    constructor() {
        var vertexShader = [
            'attribute vec2 aVertexPosition; ',
            'attribute vec2 aTextureCoord;  ',
            ' ',
            'uniform mat3 projectionMatrix; ',
            'uniform float w; ',
            'uniform float h; ',
            ' ',
            'varying vec2 vTextureCoord;  ',
            'varying vec2 vBlurTexCoords[8];  ',
            ' ',
            'void main(void)  ',
            '{  ',
            '     gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);  ',
            '     vTextureCoord = aTextureCoord; ',
            '    ',
            '     vBlurTexCoords[ 0] = aTextureCoord + vec2(-0.7 * w , 0.7  * h); ',
            '     vBlurTexCoords[ 1] = aTextureCoord + vec2(-1.0 * w , 0.000   ); ',
            '     vBlurTexCoords[ 2] = aTextureCoord + vec2(-0.7 * w ,-0.7  * h); ',
            '     vBlurTexCoords[ 3] = aTextureCoord + vec2( 0.000   ,-1.0  * h); ',
            '     vBlurTexCoords[ 4] = aTextureCoord + vec2( 0.7 * w ,-0.7  * h); ',
            '     vBlurTexCoords[ 5] = aTextureCoord + vec2( 1.0 * w , 0.000   ); ',
            '     vBlurTexCoords[ 6] = aTextureCoord + vec2( 0.7 * w , 0.7  * h); ',
            '     vBlurTexCoords[ 7] = aTextureCoord + vec2( 0.000   , 1.0  * h); ',
            '    ',
            '}  ',
        ].join('\n');
        var fragmentShader = [
            'precision lowp float; ',
            '     ',
            'varying vec2 vTextureCoord; ',
            'varying vec2 vBlurTexCoords[8]; ',
            '     ',
            'uniform sampler2D uSampler; ',
            '     ',
            'void main(void) ',
            '{    ',
            '    gl_FragColor = texture2D(uSampler, vTextureCoord ) * 1.00; ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[0])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[1])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[2])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[3])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[4])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[5])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[6])*0.1;  ',
            '    gl_FragColor += texture2D(uSampler, vBlurTexCoords[7])*0.1;  ',
            '}       ',
        ].join('\n');
        var uniforms = {
            w: { type: '1f', value: 6 / display_width },
            h: { type: '1f', value: 6 / display_height }
        };
        super(vertexShader, fragmentShader, uniforms);

    }
    applyFilter(renderer, input, output, clear) {
        this.uniforms.w.value = 8 / display_width;
        this.uniforms.h.value = 8 / display_height;
        super.applyFilter(renderer, input, output, clear);
    }
};


class NoiseFilter extends PIXI.AbstractFilter {
    constructor() {
        var vertexShader = null;
        var fragmentShader = [
                "precision mediump float; ",
                "varying vec2 vTextureCoord; ",
                "varying vec4 vColor; ",
                "uniform sampler2D uSampler; ",
                "uniform vec4 noiseLevelRGBA; ",

                "float rand(vec2 co) { ",
                "      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);    ",
                "}     ",
                "void main(void) { ",
                "      gl_FragColor = texture2D(uSampler, vTextureCoord); ",
                "      float randomDelta = (rand(vTextureCoord) * 2.0) - 1.0; ",
                "      gl_FragColor.r += noiseLevelRGBA.r * randomDelta; ",
                "      gl_FragColor.g += noiseLevelRGBA.g * randomDelta; ",
                "      gl_FragColor.b += noiseLevelRGBA.b * randomDelta; ",
                "      gl_FragColor.a += noiseLevelRGBA.a * randomDelta; ",
                "}",
        ].join('\n');;
        var uniforms = {
            noiseLevelRGBA: { type: '4fv', value: [0.2, 0.2, 0.2, 0.5] },
        };
        super(vertexShader, fragmentShader, uniforms);
        this.uniforms = uniforms;
        this.passes = [this];
    }
    get noiseLevelRGBA() {
        return this.uniforms.noiseLevelRGBA.value;
    }
    set noiseLevelRGBA(value) {
        this.uniforms.noiseLevelRGBA.value = value;
    }
}



class InverseAlpha extends PIXI.AbstractFilter {
    constructor() {
        var vertexShader = null;
        var fragmentShader = [
          'precision mediump float;',
          'varying vec2 vTextureCoord;',
          'uniform sampler2D uSampler;',
          'void main(void)',
          '{',
          '    vec4 pixel = texture2D(uSampler, vTextureCoord);',
          '    pixel.a = 1.00 - pixel.a;',
          '    gl_FragColor = pixel;',
          '}'
        ].join('\n');
        var uniforms = { };
        super(vertexShader, fragmentShader, uniforms);
    }
};


class Lighter4x extends PIXI.AbstractFilter {
    constructor() {
        var vertexShader = null;
        var fragmentShader = [
          'precision mediump float;',
          'varying vec2 vTextureCoord;',
          'uniform sampler2D uSampler;',
          'void main(void)',
          '{',
          '    vec4 pixel = texture2D(uSampler, vTextureCoord);',
          '    pixel.r *= 4.00;',
          '    pixel.g *= 4.00;',
          '    pixel.b *= 4.00;',
          '    gl_FragColor = pixel;',
          '}'
        ].join('\n');
        var uniforms = { };
        super(vertexShader, fragmentShader, uniforms);
    }

};

