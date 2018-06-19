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
    
    spawn_food(c);
    get_circle(c);
    random_cell(c);
}

var players;
var moves;
var tp;
var food;
var food_locations = [];
var i = 0;
var got_stats = false;

function setup(c){
    players = {
        p : {
            x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
            y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
            magX : 0,
            magY : 0,
            r : 32,
            hp : 100,
            max_hp : 100,
            nrg : 0,
            max_nrg : 100,
            pel : 0,
            max_pel : 100,
            pelMode : "norm",
            sta : 100,
            max_sta : 100,
            movable : true,
            ctx : c.getContext("2d")
        },
        rc : {
            x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
            y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
            r : 32,
            hp : 100,
            max_hp : 100,
            nrg : 0,
            max_nrg : 100,
            pel : 0,
            max_pel : 100,
            pelMode : "norm",
            sta : 100,
            max_sta : 100,
            ctx : c.getContext("2d")
        }
    };
    moves = {
        c3 : false,
        c4 : false,
        c5 : false
    };

    tp = {
        badClick : false,
        o : {
            r : 200,
            ctx : c.getContext("2d")   
        },
        i : {
            ctx : c.getContext("2d")  
        }
    };
    
    food = {
        x : Math.floor(Math.random() * c.width) + (Math.floor(Math.random() * 100) / 100),
        y : Math.floor(Math.random() * c.height) + (Math.floor(Math.random() * 100) / 100),
        r : 3,
        spawn : true,
        fc : false
    };
    
    get_circle(c);
    random_cell(c);
    create_food(c);
    update_stats();
}

function get_circle(c){
    players.p.ctx.beginPath();
    players.p.ctx.arc(players.p.x,players.p.y,players.p.r,0,2*Math.PI);
    players.p.ctx.closePath();
    players.p.ctx.fillStyle = "white";
    players.p.ctx.fill();
}

function random_cell(c){
    players.rc.ctx.beginPath();
    players.rc.ctx.arc(players.rc.x,players.rc.y,players.rc.r,0,2*Math.PI)
    players.rc.ctx.closePath();
    players.rc.ctx.fillStyle = "blue";
    players.rc.ctx.fill();   
}

function create_food(c){
    if(!food.fc){
        for(i; i < 50; i++){
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
                i--;
                food.spawn = true;
            }     
        }
        food.fc = true;
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
    random_cell(c);
    get_circle(c);
}

function update_stats(){
    call_stats();
    function call_stats(){
        var hn = document.getElementById("health_number");
        var en = document.getElementById("energy_number");
        var pn = document.getElementById("pellets_number");
        var sn = document.getElementById("stamina_number");

        var setHealth = Math.round(players.p.max_hp * (players.p.hp / players.p.max_hp) * 100) / 100;
        health.style.width = setHealth + "px";
        players.p.hp = setHealth;
        hn.innerHTML = players.p.hp + "/" + players.p.max_hp;

        var setEnergy = Math.round(players.p.max_nrg * (players.p.nrg / players.p.max_nrg) * 100) / 100;
        energy.style.width = setEnergy + "px";
        players.p.nrg = setEnergy;
        en.innerHTML = players.p.nrg + "/" + players.p.max_nrg;

        var setPellets = Math.round(players.p.max_pel * (players.p.pel / players.p.max_pel) * 100) / 100;
        pellets.style.width = setPellets + "px";
        players.p.pel = setPellets;
        pn.innerHTML = players.p.pel + "/" + players.p.max_pel;

        var setStamina = Math.round(players.p.max_sta * (players.p.sta / players.p.max_sta) * 100) / 100;
        stamina.style.width = setStamina + "px";
        players.p.sta = setStamina;
        sn.innerHTML = players.p.sta + "/" + players.p.max_sta;  
    }
    
    var update = setInterval(function(){
        //Health
        if(players.p.max_hp > players.p.hp && players.p.max_hp - players.p.hp >= .2){
            players.p.hp += .2;
        } else if(players.p.max_hp - players.p.hp < .2) {
            players.p.hp += (players.p.max_hp - players.p.hp);
        } else {
            players.p.hp += 0;
        }
        
        //Energy
        if(players.p.max_nrg > players.p.nrg && players.p.max_nrg - players.p.nrg >= 1){
            players.p.nrg += 1;
        } else if(players.p.max_nrg - players.p.nrg < 1) {
            players.p.nrg += (players.p.max_nrg - players.p.nrg);
        } else {
            players.p.nrg += 0;
        }
        
        //Pellets
        
        //Stamina
        if(players.p.max_sta > players.p.sta && players.p.max_sta - players.p.sta >= 5){
            players.p.sta += 5;
        } else if(players.p.max_sta - players.p.sta < 5){
            players.p.sta += (players.p.max_sta - players.p.sta);
        } else {
            players.p.sta += 0;
        }
        update_stats_two(players);
    }, 1000);
    
    function update_stats_two(players){
        call_stats();
    }
}

window.onmousemove = move_cell;
window.onkeydown = window.onmousedown = game;

function move_cell(e){
    if(players.p.movable){
        var c = document.getElementById("canvas");
        var mouseX = e.clientX;
        var mouseY = e.clientY;
        var offsetX = (e.clientX - players.p.x);
        var offsetY = (e.clientY - players.p.y);

        if(offsetX > 3){
            offsetX = 3;
            players.p.x += offsetX;
        } else if(offsetX < -3) {
            offsetX = -3;
            players.p.x += offsetX;
        } else {
            players.p.x += offsetX;  
        }

        if(offsetY > 3){
            offsetY = 3;
            players.p.y += offsetY;
        } else if(offsetY< -3) {
            offsetY = -3;
            players.p.y += offsetY;
        } else {
            players.p.y += offsetY;  
        }
        //players.p.x = mouseX;
        //players.p.y = mouseY;
        redraw(c, e);
    }
}

function redraw(c, e){
    spawn_food(c);
    get_circle(c);
    random_cell(c);
    game(e);
}

function game(e){
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    //Teleport Key 3 
    if(((e.keyCode == 51 || e.which == 51) || moves.c3) && players.p.nrg >= 60){
        ctx.clearRect(0, 0, c.width, c.height);
        spawn_food(c);
        random_cell(c);
        get_circle(c);
        tp.o.ctx.beginPath();
        tp.o.ctx.arc(players.p.x,players.p.y,tp.o.r,0,2*Math.PI);
        tp.o.ctx.closePath();
        tp.o.ctx.fillStyle = "rgba(173, 216, 230, 0.5)";
        tp.o.ctx.fill();
        tp.o.ctx.strokeStyle = "blue";
        tp.o.ctx.lineWidth = 3;
        tp.o.ctx.stroke();
        tp.o.ctx.save();
        tp.o.ctx.clip();
        tp.o.ctx.restore();

        tp.i.ctx.fillStyle='white';
        tp.i.ctx.beginPath();
        tp.i.ctx.arc(players.p.x,players.p.y,players.p.r,0,2*Math.PI);
        tp.i.ctx.closePath();
        tp.i.ctx.fill();
        
        window.onkeydown = tpKD;
        window.onmousedown = tpMD;
        
        function tpKD(e){
            if((e.keyCode == 51 || e.which == 51) && moves.c3){
                ctx.clearRect(0, 0, c.width, c.height);
                spawn_food(c);
                random_cell(c);
                get_circle(c);
                moves.c3 = false;
                window.onkeydown = window.onmousedown = game;
            }
        }

        function tpMD(e){
            ctx.clearRect(0, 0, c.width, c.height);
            spawn_food(c);
            random_cell(c);
            if(players.rc.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.badClick = true;
            }
            get_circle(c);
            
            tp.o.ctx.beginPath();
            tp.o.ctx.arc(players.p.x,players.p.y,tp.o.r,0,2*Math.PI);
            tp.o.ctx.closePath();
            tp.o.ctx.fillStyle = "rgba(173, 216, 230, 0.5)";
            tp.o.ctx.fill();
            tp.o.ctx.strokeStyle = "blue";
            tp.o.ctx.lineWidth = 3;
            tp.o.ctx.stroke();
            tp.o.ctx.save();
            tp.o.ctx.clip();
            tp.o.ctx.restore();
            if(!tp.o.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.badClick = true;
            }
            tp.i.ctx.fillStyle='white';
            tp.i.ctx.beginPath();
            tp.i.ctx.arc(players.p.x,players.p.y,players.p.r,0,2*Math.PI);
            tp.i.ctx.closePath();
            tp.i.ctx.fill();
            if(tp.i.ctx.isPointInPath(e.clientX,e.clientY)){
                tp.badClick = true;
            }
            if((e.which == 1 || e.button == 0) && moves.c3 && !tp.badClick){
                players.p.movable = false;
                players.p.nrg -= 60;
                var radius = players.p.r;
                var getRadiusIncrement = players.p.r/300;
                var getTimer = setInterval(function(){
                    window.onmousedown = function(e){

                    }
                    window.onkeydown = function(e){

                    }  
                    if(players.p.r>= 0){
                        ctx.clearRect(0, 0, c.width, c.height);
                        spawn_food(c);
                        random_cell(c);
                        get_circle(c);
                        players.p.r -= getRadiusIncrement;
                    } else {
                        clearInterval(getTimer);
                        players.p.x = e.clientX;
                        players.p.y = e.clientY;
                        players.p.r = radius*.95;
                        tp.o.x = players.p.x;
                        tp.o.y = players.p.y;
                        tp.i.x = players.p.x;
                        tp.i.y = players.p.y;
                        tp.i.r = players.p.r;
                        random_cell(c);
                        get_circle(c);
                        moves.c3 = false;
                        players.p.movable = true;
                        window.onkeydown = window.onmousedown = game;
                    }
                }, 10);
            } else if (tp.badClick){
                tp.badClick = false;
                window.onkeydown = tpKD;
                window.onmousedown = tpMD;
            }
        }
        moves.c3 = true;
    }
}