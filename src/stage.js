
var BaseKeyCodeMap =
{
    SHIFT: 16,
    CTRL: 17,
    DELETE: 46,
    BACKSPACE: 8,
    RETURN: 13,
    KEY_SPACE: 32,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_A: 65,
    KEY_C: 67,
    KEY_D: 68,
    KEY_E: 69,
    KEY_Q: 81,
    KEY_R: 82,
    KEY_S: 83,
    KEY_V: 86,
    KEY_W: 87,
};

function Hitbox(minX, minY, maxX, maxY, data)
{
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.data = data;

    this.onMouseUp = null;
    this.onMouseDown = null;
    this.onMouseMove = null;
}

Hitbox.prototype.getWidth = function getWidth()
{
    return this.maxX - this.minX;
};

Hitbox.prototype.getHeight = function getHeight()
{
    return this.maxY - this.minY;
};

Hitbox.prototype.clearCallbacks = function clearCallbacks()
{
    this.onMouseUp = null;
    this.onMouseDown = null;
    this.onMouseMove = null;
};

function Button(x, y, width, height)
{
    this.enabledTexture = null;
    this.disabledTexture = null;
    this.enabled = true;
    this.hitbox = new Hitbox(x, y, x + width, y + height, null);
}

function Stage(canvas, renderer, scene)
{
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");
    this.renderer = renderer;
    this.scene = scene;

    this.hitboxes = [];
    this.buttons = [];

    this.onMouseDown = null;
    this.onMouseUp = null;
    this.onMouseMove = null;

    this.onKeyDown = null;
    this.onKeyUp = null;

    this.keyCodesInput = {};
}

Stage.prototype.addHitbox = function addHitbox(hitbox)
{
    this.hitboxes.push(hitbox);
};

Stage.prototype.addButton = function addButton(button)
{
    this.buttons.push(button);
    this.addHitbox(button.hitbox);
};

Stage.prototype.removeHitbox = function removeHitbox(hitbox)
{
    var i;
    for (i = 0; i < this.hitboxes.length; i += 1)
    {
        if (this.hitboxes[i] === hitbox)
        {
            this.hitboxes.splice(i, 1);
            return true;
        }
    }
    return false;
};

Stage.prototype.findHitbox = function findHitbox(x, y)
{
    var i;
    for (i = 0; i < this.hitboxes.length; i += 1)
    {
        var hitbox = this.hitboxes[i];
        if (x > hitbox.minX &&
            x < hitbox.maxX &&
            y > hitbox.minY &&
            y < hitbox.maxY)
        {
            return hitbox;
        }
    }
    return null;
};

Stage.prototype.mouseDown = function mouseDown(e)
{
    var p = [0, 0];
    this.getCanvasPosition(e, p);
    var hitbox = this.findHitbox(p[0], p[1]);
    if (hitbox && hitbox.onMouseDown)
    {
        hitbox.onMouseDown(p, e.button);
    }
    else if (this.onMouseDown)
    {
        this.onMouseDown(p, e.button);
    }
    return false;
};

Stage.prototype.mouseUp = function mouseUp(e)
{
    var p = [0, 0];
    this.getCanvasPosition(e, p);
    var hitbox = this.findHitbox(p[0], p[1]);
    if (hitbox && hitbox.onMouseUp)
    {
        hitbox.onMouseUp(p, e.button);
    }
    else if (this.onMouseUp)
    {
        this.onMouseUp(p, e.button);
    }
    return false;
};

Stage.prototype.mouseMove = function mouseMove(e)
{
    var p = [0, 0];
    this.getCanvasPosition(e, p);
    var hitbox = this.findHitbox(p[0], p[1]);
    if (hitbox && hitbox.onMouseMove)
    {
        hitbox.onMouseMove(p);
    }
    else if (this.onMouseMove)
    {
        this.onMouseMove(p);
    }
};

Stage.prototype.isKeyDown = function isKeyDown(keyCode)
{
    return this.keyCodesInput[keyCode] || false;
};

Stage.prototype.keyDown = function keyDown(e)
{
    this.keyCodesInput[e.keyCode] = true;
    if (this.onKeyDown)
    {
        this.onKeyDown(e.key, e.keyCode);
    }
};

Stage.prototype.keyUp = function keyUp(e)
{
    this.keyCodesInput[e.keyCode] = false;
    if (this.onKeyUp)
    {
        this.onKeyUp(e.key, e.keyCode);
    }
};

Stage.prototype.wheel = function wheel(y)
{
    this.onWheel(y);
}

Stage.prototype.enable = function enable()
{
    var c = this.canvas;
    c.oncontextmenu = function (e) {
        e.preventDefault();
    };
    c.addEventListener("mousedown", this.mouseDown.bind(this));
    c.addEventListener("mouseup", this.mouseUp.bind(this));
    c.addEventListener("mousemove", this.mouseMove.bind(this));
    c.addEventListener("keydown", this.keyDown.bind(this));
    c.addEventListener("keyup", this.keyUp.bind(this));

    var wheel = this.wheel.bind(this);
    function MouseWheelHandler(e)
    {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        wheel(delta);
        return false;
    }
    // IE9, Chrome, Safari, Opera
    c.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    c.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
};

Stage.prototype.getCanvasPosition = function getCanvasPosition(e, p)
{
    Stage.getDocumentPositionFromEvent(e, p);
    p[0] -= this.canvas.offsetLeft;
    p[1] -= this.canvas.offsetTop;
};

Stage.getDocumentPositionFromEvent = function getDocumentPositionFromEvent(e, p)
{
    var posx = 0;
    var posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY)     {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY)    {
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    // posx and posy contain the mouse position relative to the document
    p[0] = posx;
    p[1] = posy;
};

Stage.test = function test()
{
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var stage = new Stage(canvas);
    stage.enable();

    var hitbox = new Hitbox(0, 0, canvas.width, canvas.height, null);
    stage.addHitbox(hitbox);

    hitbox.mouseMove = function (x, y)
    {
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
    };
};

// window.onload=function()
// {
//     Stage.test();
// }
