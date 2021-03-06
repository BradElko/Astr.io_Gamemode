"use strict";
window.onload = canvas;
window.onresize = canvas_resized;

function canvas(){
    var c = document.getElementById("canvas");
    var ww = window.innerWidth;
    var wh = window.innerHeight;
    
    var health = document.getElementById("health");
    var energy = document.getElementById("energy");
    var pellets = document.getElementById("pellets");
    var stamina = document.getElementById("stamina");
    var mass = document.getElementById("mass");
    
    c.style.width = ww + "px";
    c.style.height = wh + "px";
    c.width = ww;
    c.height = wh;
    c.tabIndex = 1000;
    
    setup(c);
}

function canvas_resized(){
    var c = document.getElementById("canvas");
    var ww = window.innerWidth;
    var wh = window.innerHeight;
    
    c.style.width = ww + "px";
    c.style.height = wh + "px";
    c.width = ww;
    c.height = wh;
    c.tabIndex = 1000;
    
    redraw(c);
}

var players;
var moves;
var tp;
var food;
var food_locations = [];
var updateCounter = 0;
var foodMade = 0;
var got_stats = false;
var mousepos;
var moveWithoutMouse;
var getMasses = {};
var lastX, lastY;

function setup(c){
    players = {
        p : {
            x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
            y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
            magX : 0,
            magY : 0,
            transX : 0,
            transY : 0,
            area : 500,
            sizer : 15,
            r : 0,
            red : 0,
            green : 128,
            blue : 0,
            hp : 100,
            max_hp : 100,
            nrg : 0,
            max_nrg : 100,
            pel : 0,
            max_pel : 100,
            pelMode : "norm",
            foodcount : 0,
            storageCount : 0,
            sta : 100,
            max_sta : 100,
            movable : true,
            mouseMoved : false,
            dead : false,
            opacity : 1,
            ctx : c.getContext("2d")
        },
        rc : {
            x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
            y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
            area : 500,
            sizer : 15,
            r : 0,
            hp : 100,
            max_hp : 100,
            nrg : 0,
            max_nrg : 100,
            pel : 0,
            max_pel : 100,
            pelMode : "norm",
            sta : 100,
            max_sta : 100,
            dead : false,
            ctx : c.getContext("2d")
        }
    };
    moves = {
        c3 : false,
        c4 : false,
        c5 : false
    };

    tp = {
        cooldown : 0,
        noClick : false,
        o : {
            r : 200,
            ctx : c.getContext("2d")   
        },
    };
    
    food = {
        x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
        y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
        area : 1,
        sizer : 15,
        r : 0,
        spawn : true,
        created : false
    };
    mousepos = {
        x : players.p.x,
        y : players.p.y
    }
    getMasses = {
        p : 0,
        rc : 0
    }
    
    init(c);
    create_food(c);
    get_circle(c);
    random_cell(c);
    update_stats();
    constant_movement(c);
}

function init(c){
    //Food
    food.area *= food.sizer;
    food.r = Math.sqrt(food.area/Math.PI);
    
    //Player
    players.p.area *= players.p.sizer;
    players.p.r = Math.sqrt(players.p.area/Math.PI);
    
    //Random
    players.rc.area *= players.rc.sizer;
    players.rc.r = Math.sqrt(players.rc.area/Math.PI);
    
    //PelletMode
    if(players.p.pelMode == "Hypo"){
        players.p.storageCount = 2;
    } else if(players.p.pelMode == "Norm") {
        players.p.storageCount = 3;
    } else {
        players.p.storageCount = 4; 
    }
}

function create_food(c){
    if(!food.created){
        for(foodMade; foodMade < 50; foodMade++){
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);

            random_cell(c);
            if(players.rc.ctx.isPointInPath(food.x, food.y)){
                food.x = Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100);
                food.y = Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100);
                food.spawn = false;
            }
            get_circle(c);
            if(players.rc.ctx.isPointInPath(food.x, food.y)){
                food.x = Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100);
                food.y = Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100);
                food.spawn = false;
            }
            if(food.spawn){
                food_locations.push({
                    x : food.x,
                    y : food.y
                });

                food.x = Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100);
                food.y = Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100);
            } else {
                foodMade--;
                food.spawn = true;
            }     
        }
        food.created = true;
        spawn_food(c);  
    } else {
       spawn_food(c); 
    }
    
}

function spawn_food(c){
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    
    for(var j = 0; j < 50; j++){
        ctx.beginPath();
        ctx.arc(food_locations[j].x,food_locations[j].y,food.r,0,2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    top_cell(c);
}

function get_circle(c){
    if(!players.p.dead){
        players.p.ctx.save(); 
        if(players.p.magX != 0 && players.p.magY != 0 && players.p.movable){
            players.p.ctx.translate(players.p.transX,players.p.transY);
            players.p.x = players.p.transX;
            players.p.y = players.p.transY;
        } else {
            players.p.ctx.translate(players.p.x,players.p.y);
        }
        players.p.ctx.beginPath();
        players.p.ctx.arc(0,0,players.p.r,0,2*Math.PI);
        players.p.ctx.closePath();
        players.p.ctx.fillStyle = "rgba("+players.p.red+","+players.p.green+","+players.p.blue+","+players.p.opacity+")";
        players.p.ctx.fill();  
        players.p.ctx.restore(); 
    }
}

function random_cell(c){
    if(!players.rc.dead){
        players.rc.ctx.beginPath();
        players.rc.ctx.arc(players.rc.x,players.rc.y,players.rc.r,0,2*Math.PI)
        players.rc.ctx.closePath();
        players.rc.ctx.fillStyle = "blue";
        players.rc.ctx.fill();    
    }  
}

function update_stats(){
    var hn = document.getElementById("health_number");
    var en = document.getElementById("energy_number");
    var pn = document.getElementById("pellets_number");
    var sn = document.getElementById("stamina_number");
    var mn = document.getElementById("mass_number");
    call_stats();
    function call_stats(){
        var setHealth = Math.round(players.p.max_hp * (players.p.hp / players.p.max_hp) * 100) / 100;
        health.style.width = setHealth + "px";
        players.p.hp = setHealth;
        hn.innerHTML = players.p.hp + "/" + players.p.max_hp;

        var setEnergy = Math.round(players.p.max_nrg * (players.p.nrg / players.p.max_nrg) * 100) / 100;
        energy.style.width = setEnergy + "px";
        players.p.nrg = setEnergy;
        en.innerHTML = players.p.nrg + "/" + players.p.max_nrg;

        var setStamina = Math.round(players.p.max_sta * (players.p.sta / players.p.max_sta) * 100) / 100;
        stamina.style.width = setStamina + "px";
        players.p.sta = setStamina;
        sn.innerHTML = players.p.sta + "/" + players.p.max_sta;  
    }
    
    var update = setInterval(function(){
        //Health
        if(players.p.max_hp > players.p.hp && players.p.max_hp - players.p.hp >= .002){
            players.p.hp += .002;
        } else if(players.p.max_hp - players.p.hp < .002) {
            players.p.hp += (players.p.max_hp - players.p.hp);
        } else {
            players.p.hp += 0;
        }
        
        //Energy
        if(players.p.max_nrg > players.p.nrg && players.p.max_nrg - players.p.nrg >= .01){
            players.p.nrg += .01;
        } else if(players.p.max_nrg - players.p.nrg < .01) {
            players.p.nrg += (players.p.max_nrg - players.p.nrg);
        } else {
            players.p.nrg += 0;
        }
        
        //Pellets
        var setPellets = Math.round(players.p.max_pel * (players.p.pel / players.p.max_pel) * 100) / 100;
        pellets.style.width = setPellets + "px";
        players.p.pel = setPellets;
        pn.innerHTML = players.p.pel + "/" + players.p.max_pel;
        
        //Stamina
        if(players.p.max_sta > players.p.sta && players.p.max_sta - players.p.sta >= .05){
            players.p.sta += .05;
        } else if(players.p.max_sta - players.p.sta < .05){
            players.p.sta += (players.p.max_sta - players.p.sta);
        } else {
            players.p.sta += 0;
        }
        
        //Mass
        var setMass = Math.floor(players.p.area / players.p.sizer);
        mass.style.width = "100%";
        mn.innerHTML = setMass;
        
        updateCounter += 10;
        
        if(updateCounter == 1000){
            update_stats_two(players);  
        }
    }, 10);
    
    function update_stats_two(players){
        updateCounter = 0;
        call_stats();
    }
}

function constant_movement(c){
    moveWithoutMouse = setInterval(function(){
        if(players.p.movable && (mousepos.x == lastX && mousepos.y == lastY)){
            players.p.mouseMoved = false;
            player_movement(mousepos);
            redraw(c);
            moves_list(mousepos);
        }
    }, 10);  
} 

window.onmousemove = window.onmouseover = move_cell;
window.onkeydown = window.onmousedown = window.oncontextmenu = moves_list;

function player_movement(getmouse){
    mousepos = getmouse;
    var offsetX = (mousepos.x - players.p.x);
    var offsetY = (mousepos.y - players.p.y);
    var dist = Math.sqrt((offsetX * offsetX) + (offsetY * offsetY));
    var multiplyer = .0375 * (7500 / players.p.area);
    
    if(dist > players.p.r){
        var mag = players.p.r;
        var magX = (mag * offsetX) / dist;
        var magY = (mag * offsetY) / dist;

        players.p.magX = magX * (players.p.sta / players.p.max_sta) * multiplyer;
        players.p.magY = magY * (players.p.sta / players.p.max_sta) * multiplyer;

        players.p.transX = players.p.x + players.p.magX;
        players.p.transY = players.p.y + players.p.magY;
    } else {
        var magX = offsetX;
        var magY = offsetY;

        players.p.magX = magX * (players.p.sta / players.p.max_sta) * multiplyer;
        players.p.magY = magY * (players.p.sta / players.p.max_sta) * multiplyer;

        players.p.transX = players.p.x + players.p.magX;
        players.p.transY = players.p.y + players.p.magY;
    }
    if(players.p.mouseMoved){
        var c = document.getElementById("canvas");
        constant_movement(c);
    }
}

function move_cell(e){
    if(players.p.movable){
        players.p.mouseMoved = true
        clearInterval(moveWithoutMouse);
        var c = document.getElementById("canvas");
        mousepos = {
            x : e.clientX,
            y : e.clientY
        }
        player_movement(e);
        redraw(c);
        moves_list(e);
    } else {
        mousepos = {
            x : e.clientX,
            y : e.clientY
        }
        moves_list(e);
    }
    lastX = mousepos.x;
    lastY = mousepos.y;
}

function eat_pellets(c){
    for(var i = 0; i < 50; i++){
        if(players.p.ctx.isPointInPath(food_locations[i].x,food_locations[i].y) && players.p.area >= food.area * 1.25){
            food_locations.splice(i,1);
            players.p.foodcount++;
            if(players.p.foodcount % players.p.storageCount == 0 && players.p.max_pel > players.p.pel){
                players.p.pel++;
                players.p.foodcount=0;
            } else {
                players.p.area += food.area;
                players.p.r = Math.sqrt(players.p.area/Math.PI);  
            }
            foodMade--;
            food.created = false;
            create_food(c);
        }
    }
}

function eat_players(c){
    if(players.p.ctx.isPointInPath(players.rc.x,players.rc.y) && players.p.area >= players.rc.area * 1.25 && !players.rc.dead){
        var playerGrowth = 0;
        var playerTimer = setInterval(function(){
            if(playerGrowth < 1000){
                players.p.area += players.rc.area / 100;
                players.p.r = Math.sqrt(players.p.area/Math.PI);
                playerGrowth += 10;
            } else {
                clearInterval(playerTimer);
            }
        }, 10);
        players.rc.dead = true;
        
        redraw(c);
    }
}

function top_cell(c){
    getMasses = {
        p : players.p.area,
        rc : players.rc.area
    };
    if(getMasses.p > getMasses.rc){
        random_cell(c);
        get_circle(c);
        eat_pellets(c);
        eat_players(c);
    } else {
        get_circle(c);
        eat_pellets(c);
        eat_players(c);
        random_cell(c);
    }
}

function redraw(c){
    spawn_food(c);
    top_cell(c);
}

function moves_list(e){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    //Teleport Key 3 
    if(((e.keyCode == 51 || e.which == 51) || moves.c3) && players.p.nrg >= 60 && tp.cooldown == 0 && !moves.c4 && !moves.c5){
        tp.o.ctx.beginPath();
        tp.o.ctx.arc(players.p.x,players.p.y,tp.o.r+players.p.r,0,2*Math.PI);
        tp.o.ctx.closePath();
        tp.o.ctx.fillStyle = "rgba(173, 216, 230, 0.5)";
        tp.o.ctx.fill();
        tp.o.ctx.strokeStyle = "blue";
        tp.o.ctx.lineWidth = 3;
        tp.o.ctx.stroke();
        
        window.onkeydown = tpKD;
        window.onmousedown = tpMD;
        
        function tpKD(e){
            if((e.keyCode == 51 || e.which == 51) && moves.c3){
                ctx.clearRect(0, 0, c.width, c.height);
                redraw(c);
                moves.c3 = false;
                window.onkeydown = window.onmousedown = moves_list;
            }
        }

        function tpMD(e){
            ctx.clearRect(0, 0, c.width, c.height);
            spawn_food(c);
            random_cell(c);
            if(players.rc.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.noClick = true;
            }
            get_circle(c);
            if(players.p.ctx.isPointInPath(players.rc.x,players.rc.y) || players.p.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.noClick = true;
            }
            tp.o.ctx.beginPath();
            tp.o.ctx.arc(players.p.x,players.p.y,tp.o.r+players.p.r,0,2*Math.PI);
            tp.o.ctx.closePath();
            tp.o.ctx.fillStyle ="rgba("+players.p.red+","+players.p.green+","+players.p.blue+","+7.5+")";
            tp.o.ctx.fill();
            tp.o.ctx.strokeStyle = "blue";
            tp.o.ctx.lineWidth = 3;
            tp.o.ctx.stroke();
            tp.o.ctx.save();
            tp.o.ctx.clip();
            tp.o.ctx.restore();
            if(!tp.o.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.noClick = true;
            }
            if((e.which == 1 || e.button == 0) && moves.c3 && !tp.noClick){
                players.p.movable = false;
                players.p.nrg -= 60;
                clearInterval(moveWithoutMouse);
                tp.cooldown = 30000;
                tpCD();
                var area = players.p.area;
                var getArealIncrement = players.p.area/300;
                var getTimer = setInterval(function(){
                    if(players.p.area>= 0){
                        redraw(c);
                        players.p.area -= getArealIncrement;
                        players.p.r = Math.sqrt(players.p.area/Math.PI);
                    } else {
                        moves.c3 = false;
                        clearInterval(getTimer);
                        players.p.x = e.clientX;
                        players.p.y = e.clientY;
                        players.p.area = area*.95;
                        players.p.r = Math.sqrt(players.p.area/Math.PI);
                        redraw(c);
                        players.p.movable = true;
                        constant_movement(c);
                        window.onkeydown = window.onmousedown = moves_list;
                    }
                }, 10);
            } else {
                tp.noClick = false;
                window.onkeydown = tpKD;
                window.onmousedown = tpMD;
            }
        }
        function tpCD(){
            var cooldown = setInterval(function(){
                if(tp.cooldown > 0){
                    tp.cooldown -= 1000;    
                } else {
                    clearInterval(cooldown);
                }
            }, 1000);
        }
        moves.c3 = true;
    //Cloak Key 4
    } else if (((e.keyCode == 52 || e.which == 52) || moves.c4) && players.p.nrg >= 50 && !moves.c5 && !moves.c5){
        console.log("You have pressed 4");
    }
}