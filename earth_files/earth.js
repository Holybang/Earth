var debugFlag = 0;

function debugCall(s)
{
    if(debugFlag) console.log(s);
}

function vec2toString()
{
    return this.x + ", " + this.y;
}

function stringToVec2(s)
{
	var slst = s.split(",");
	return newVector2(slst[0].replace(" ", "") - 0, slst[1].replace(" ", "") - 0);
}

function newVector2(x, y)
{
	//debugCall("newVector2(x, y)");
    vec = new Object();
	if(x == undefined) {
	    x = 0;
	}
	if(y == undefined) {
	    y = 0;
	}
	vec.x = x;
	vec.y = y;
	vec.toString = vec2toString;
	return vec;
}

function vector2Dis(vec0, vec1)
{
    //debugCall("vector2Dis(vec0, vec1)");
    dx = vec0.x - vec1.x;
	dy = vec0.y - vec1.y;
    return Math.sqrt(dx*dx + dy*dy);
}

function dotMulVec2(vec0, vec1)
{
    //debugCall("dotMulVec2(vec0, vec1)");
    return vec0.x*vec1.x + vec0.y*vec1.y;
}

function mulVec2(vec0, a)
{
    //debugCall("mulVec2(vec0, a)");
    return newVector2(vec0.x*a, vec0.y*a);
}

function normalizedVec2(vec)
{
    len = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
	return mulVec2(vec, 1.0/len);
}

function addVec2(vec0, vec1)
{
    //debugCall("addVec2(vec0, vec1)");
    return newVector2(vec0.x + vec1.x, vec0.y + vec1.y);
}

function subVec2(vec0, vec1)
{
	return newVector2(vec0.x - vec1.x, vec0.y - vec1.y);
}

function moveFun(k, b, x)
{
    //debugCall("moveFun(k, b, x)");
    return k*x + b;
}

function isNoneZeroVec2(vec)
{
    debugCall("isNoneZeroVec2(vec)");
    return vec.x != 0 || vec.y != 0;
}

function vec2Len(vec)
{
	return vector2Dis(vec, newVector2());
}

function gravity( m0, m1, dis, G)
{
    if(dis < 1) 
	    return 0;
    return G*m0*m1/(dis*dis);
}

function gravity_f(m0, p0, m1, p1, G)
{
	debugCall("m0 " + m0.toString());
	debugCall("m1 " + m1.toString());
	debugCall("p0 " + p0.toString());
	debugCall("p1 " + p1.toString());
	var f_s = gravity(m0, m1, vector2Dis(p0, p1), G);
	
	debugCall("f_s " + f_s.toString());
	
	var f_dir = subVec2(p1, p0);
	if(vec2Len(f_dir) < 0.01) 
	    return newVector2();
	else
		f_dir = normalizedVec2(f_dir);
	
	return mulVec2(f_dir, f_s);
}

function gravity_ps_f( m, p, ms, ps, G)
{
    debugCall("m " + m.toString());
	debugCall("p " + p.toString());
	debugCall("ms " + ms.toString());
	debugCall("ps " + ps.toString());
    var f = newVector2();
	for(var i = 0; i < ms.length; i++) {
	    f = addVec2(f, gravity_f(m, p, ms[i], ps[i], G));
		//console.log(i.toString() + " " + f.toString());
	}
	return f;
}

function rotate( p, o, angle)
{
    var pp = subVec2(p, o);
	//console.log("pp " + pp.toString());
	pp = newVector2(Math.cos(angle)*pp.x - Math.sin(angle)*pp.y, Math.sin(angle)*pp.x + Math.cos(angle)*pp.y );
	//console.log("pp " + pp.toString());
	return addVec2(pp, o);
}

var o = newVector2(100, 100);
var r = 50;
var earth_ms = new Array();
var earth_ps = new Array();
var earth_ps_count = 40;
var earth_m = 1000000;
var earth_partical_m = earth_m/earth_ps_count;
var earth_piece_count = 10;

var ball_start_pos = addVec2(o, newVector2(-r, 0));
var ball_r = 0.2;
var ball_pos = ball_start_pos;
var ball_start_v = newVector2(0, 0);
var ball_v = ball_start_v;

var ball_m = 10;
var G = 0.0001;
var earth_w = 1;

var pre_ball_pos = ball_pos;

var timer_is_on = 0;
var count = 0;
var timeStep = 10;

var slow_down_s = 1;

var history_pos = new Array();
history_pos[0] = ball_start_pos;

var graphicsS = 1.0;
var graphicsT = newVector2();

var cw = 500;
var ch = 500;

function initialize()
{
	ball_pos = ball_start_pos;
	ball_v = ball_start_v;

	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	ctx.width = cw;
	ctx.height = ch;
	ctx.translate(graphicsT.x, graphicsT.y);
	ctx.scale(graphicsS, graphicsS);	
	
	ball_r /= graphicsS;
	
	earth_ps = new Array();
	earth_ms = new Array();
	
	debugCall(earth_ms);
	debugCall(earth_ps);
	
	var ii = 0;

	for(var i = 0; i < earth_piece_count; i++) {
		var tmp = (earth_piece_count - i)/earth_piece_count;
		var ps_count = earth_ps_count*tmp*tmp*tmp;
		for(var j = 0; j < earth_ps_count; j++) {
			if(j == 0 || j == earth_ps_count/2) {
				//continue;
			}
			earth_ps[ii] = rotate(newVector2(o.x - r*tmp, o.y), o, j*Math.PI*2/earth_ps_count);
			earth_ms[ii] = earth_partical_m;
			//debugCall(earth_ps[ii].toString());
			ii++;
		}
	}
	
	//debugCall(earth_ms);
	//debugCall(earth_ps);
}

function resetParameters()
{
	o = newVector2(100, 100);
	r = 50;
	earth_ms = new Array();
	earth_ps = new Array();
	earth_ps_count = 40;
	earth_m = 1000000;
	earth_partical_m = earth_m/earth_ps_count;
	earth_piece_count = 10;
	ii = 0;

	ball_start_pos = addVec2(o, newVector2(-r, 0));
	ball_r = 0.2;
	
	ball_start_v = newVector2(0, 0);
	
	ball_m = 10;
	G = 0.0001;
	earth_w = 1;

	pre_ball_pos = ball_pos;

	timer_is_on = 0;
	count = 0;
	timeStep = 10;

	slow_down_s = 1;

	history_pos = new Array();
	history_pos[0] = ball_start_pos;

	graphicsS = 1.0;
	graphicsT = newVector2();
	
	var2Input();
	
	initialize();
}

function inputToVar()
{
	//update parameters
	var inputStr = document.getElementById('EarthCenter').value;
	if(inputStr != "") {
		o = stringToVec2(inputStr);
	}

	inputStr = document.getElementById('EarthRadius').value;
	if(inputStr != "") {
		r = inputStr;
	}

	inputStr = document.getElementById('EarthW').value;
	if(inputStr != "") {
		earth_w = inputStr;
	}

	inputStr = document.getElementById('EarthPieceNum').value;
	if(inputStr != "") {
		earth_piece_count = inputStr;
	}

	inputStr = document.getElementById('EarthPs').value;
	if(inputStr != "") {
		earth_ps_count = inputStr;
	}

	inputStr = document.getElementById('ParticalMass').value;
	if(inputStr != "") {
		earth_partical_m = inputStr;
	}

	inputStr = document.getElementById('BallStartPos').value;
	if(inputStr != "") {
		ball_start_pos = stringToVec2(inputStr);
	}

	inputStr = document.getElementById('BallStartV').value;
	if(inputStr != "") {
		ball_start_v = stringToVec2(inputStr);
	}

	inputStr = document.getElementById('BallMass').value;
	if(inputStr != "") {
		ball_m = inputStr;
	}

	inputStr = document.getElementById('ConstG').value;
	if(inputStr != "") {
		G = inputStr;
	}

	inputStr = document.getElementById('FramePerS').value;
	if(inputStr != "") {
		timeStep = 1000/inputStr;
	}

	inputStr = document.getElementById('TimeScale').value;
	if(inputStr != "") {
		slow_down_s = inputStr;
	}
	
	inputStr = document.getElementById('GraphicsS').value;
	if(inputStr != "") {
		graphicsS = inputStr;
	}
	
	inputStr = document.getElementById('GraphicsT').value;
	if(inputStr != "") {
		graphicsT = stringToVec2(inputStr);
	}
	
	inputStr = document.getElementById('CanvasW').value;
	if(inputStr != "") {
		cw = inputStr;
	}
	
	inputStr = document.getElementById('CanvasH').value;
	if(inputStr != "") {
		ch = inputStr;
	}
	
	initialize();
}

function var2Input()
{
	//update parameters
	document.getElementById('EarthCenter').value = o.toString();
	
	document.getElementById('EarthRadius').value = r;
	
	document.getElementById('EarthW').value = earth_w;
	
	document.getElementById('EarthPieceNum').value = earth_piece_count;
	
	document.getElementById('EarthPs').value = earth_ps_count;
	
	document.getElementById('ParticalMass').value = earth_partical_m;
	
	document.getElementById('BallStartPos').value = ball_start_pos.toString();
	
	document.getElementById('BallStartV').value = ball_start_v.toString();
	
	document.getElementById('BallMass').value = ball_m;
	
	document.getElementById('ConstG').value = G;
	
	document.getElementById('FramePerS').value = 1000/timeStep;
	
	document.getElementById('TimeScale').value = slow_down_s;
	
	document.getElementById('GraphicsS').value = graphicsS;
	
	document.getElementById('GraphicsT').value = graphicsT;
	
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	
	if(c == undefined) {
		console.log("canvas is undefined");
	}
	
	document.getElementById('CanvasW').value = ctx.width;
	
	document.getElementById('CanvasH').value = ctx.height;
}

function redraw()
{
    debugCall("redraw()");
	
    var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	
	var ball_earth_dis = vector2Dis(ball_pos, o);

	//var f = gravity_f(ball_m, ball_pos, earth_m, o, G);
	var f = gravity_ps_f(ball_m, ball_pos, earth_ms, earth_ps, G);
	
	console.log("f " + f.toString());
	
	var a = mulVec2(f, 1.0/ball_m);
	
	console.log("a " + a.toString());
	
	ball_v = addVec2(ball_v, mulVec2(a, timeStep/1000*slow_down_s));
	
	console.log("v " + ball_v.toString());
	
	var ball_ds = mulVec2(ball_v, timeStep/1000*slow_down_s);
	
	ball_pos = addVec2(ball_pos, ball_ds);
	
	//ball_pos = rotate(ball_pos, o, earth_w);

	ctx.clearRect(0, 0, c.width, c.height);
	ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
	//ctx.moveTo(pre_ball_pos.x,pre_ball_pos.y);
	//ctx.lineTo(ball_pos.x, ball_pos.y);
	ctx.stroke();
	ctx.fillStyle="#FF0000";
	ctx.beginPath();
	//ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
	ctx.moveTo(ball_pos.x, ball_pos.y);
	ctx.arc(ball_pos.x, ball_pos.y, ball_r, 0, Math.PI*2, true);
	for(var i = 0; i < history_pos.length; i++) {
	    ctx.arc(history_pos[i].x, history_pos[i].y, 1, 0, Math.PI*2, true);
	}
	ctx.closePath();
	ctx.fill();
	
	console.log("pos " + ball_pos.toString());
		
	if(vector2Dis(ball_pos, history_pos[history_pos.length - 1]) > 1)
		history_pos[history_pos.length] = ball_pos;	
	
	for(var i = 0; i < history_pos.length; i++) {
	    history_pos[i] = rotate(history_pos[i], o, earth_w/180*Math.PI*timeStep/1000*slow_down_s);
	}
	
	pre_ball_pos = ball_pos;
}

function timedCount()
{
debugCall("timeCount()");
document.getElementById('lineEditor0').value=count;
count=count+1;
redraw();
t=setTimeout("timedCount()",timeStep);
}

function doTimer()
{
	debugCall("doTimer()");
	
	document.getElementById('startBtn').value = "Continue";

	inputToVar();

	if (!timer_is_on)
	{
	    timer_is_on=1;
	    timedCount();
	}
}

function stopCount()
{
debugCall("stopCount()");
clearTimeout(t);
timer_is_on=0;
}