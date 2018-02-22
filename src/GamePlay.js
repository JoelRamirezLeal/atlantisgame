
var pointerX;
var pointerY;
var distanciaX;
var distanciaY;
var AMOUNT_DIAMONDS=30;
var scoreText;
var currentScore=0;
var amountDiamond=0;
var AMOUNT_BOOBLES=30;

GamePlayManager = {
    init: function() {

        //init Se ejecuta cuando inicia el juego

        //Esta línea hace que el juego se adapte a la pantalla
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //Para alinear horizontal o verticalmente
        //Alinea horizontalmente al centro
        game.scale.pageAlignHorizontally = true;
        //Alinea verticalmente al centro
        game.scale.pageAlignVertically = true;

        //flag
        this.flagFirstMouseDown=false;

        this.endGame=false;

        this.countSmile=-1;
    },
    preload: function() {
        //preload Carga todos los elementos necesarios para el videojuego

        //carga una imagen, se usa junto a create
        game.load.image('background', 'assets/images/background.png')

        //carga un spritesheet, spritesheet es una hoja de sprites, se usa generalmente para animacion
        //identificador, ruta, ancho, alto, numero de imagenes
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2);

        //Carga los diamantes como spriteshee
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);

        //carga la imagen de la explosion
        game.load.image('explosion', 'assets/images/explosion.png');

        //tiburón
        game.load.image('shark', 'assets/images/shark.png');

        //pescaditos
        game.load.image('fishes', 'assets/images/fishes.png');

        //pulpo
        game.load.image('mollusk', 'assets/images/mollusk.png');

        //burbujas
        game.load.image('booble1', 'assets/images/booble1.png');
        game.load.image('booble2', 'assets/images/booble2.png');
    },
    create: function() {
        //create Agrega los elementos cargados al videojuego

        //Línea para mostrar una imágen
        game.add.sprite(0, 0, 'background');

        //burbujas 
        this.boobleArray=[];
        for(var i=0; i<AMOUNT_BOOBLES; i++){
            var xBooble=game.rnd.integerInRange(1, 1140);
            var yBooble=game.rnd.integerInRange(600, 950);

            var booble= game.add.sprite(xBooble, yBooble, 'booble'+game.rnd.integerInRange(1,2));
            booble.vel = 0.2+game.rnd.frac()*2;
            booble.alpha=game.rnd.frac()+0.2;
            this.boobleArray[i]=booble;
        }

        this.shark = game.add.sprite(500, 20, 'shark');

        this.fishes= game.add.sprite(100, 550, 'fishes');

        this.mollusk = game.add.sprite(500, 150, 'mollusk');   

        //game.add.sprite(0, 0, 'horse');
        //también se puede crear una instancia para utilizar diferentes propiedades de spritesheet
        this.horse=game.add.sprite(0, 0, 'horse');
        //frame 0 o 1, por tener dos imágenes la imágen
        this.horse.frame=1;
        //cambia la posicion en x
        this.horse.x=game.width/2;
        //cambia la posicion en y
        this.horse.y=game.height/2;
        //cambia el punto de anclaje del sprite
        this.horse.anchor.setTo(0.5);
        //rota el sprite
        this.horse.angle=15;
        //para escalar
        this.horse.scale.setTo(1);          
        //para opacidad
        this.horse.alpha=1;

        //llama una funcion cuando hace un clic, llama la funcion onTap
        game.input.onDown.add(this.onTap, this);

        //
        this.diamonds=[];
        for(var i=0; i<AMOUNT_DIAMONDS; i++){
            var diamond=game.add.sprite(100,100, 'diamonds');
            diamond.frame=game.rnd.integerInRange(0,3);
            diamond.scale.setTo(0.3 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x=game.rnd.integerInRange(50,1050);
            diamond.y=game.rnd.integerInRange(50,600);

            this.diamonds[i] = diamond;
            var rectCurrenDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse);

            while(this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectHorse, rectCurrenDiamond) ){
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsDiamond(diamond);
            }
        }

        this.explosionGroup = game.add.group();
       
        for(var i=0; i<10; i++){
            this.explosion = this.explosionGroup.create(100,100,'explosion');
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({x: [0.4, 0.8, 0.4], y: [0.4, 0.8, 0.4]}, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({alpha: [1, 0.6, 0]}, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
        
/*         //CREANDO UN TWEEN
        var tween = game.add.tween(this.explosion);
        //Definiendo las propiedades del tween 
        
        tween.to({x:500, y:100}, 1500, Phaser.Easing.Back.Out);
        tween.start(); */  

        var style={
            font: 'bold 30px Arial',
            fill: '#ffffff',
            align: 'center'
        }

        this.scoreText = game.add.text(game.width/2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);

        this.totalTime=30;
        this.timerText = game.add.text(game.width/2+500, 40, this.totalTime+'', style);
        this.timerText.anchor.setTo(0.5);
    
        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text=this.totalTime+'';
                if(this.totalTime==0){
                    this.endGame=true;
                    game.time.events.remove(this.timerGameOver);
                    this.showFinalMessage('GAME OVER');
                }
            }
        }, this);

        
    },
    increaseScore:function(){
        this.countSmile=0;
        this.horse.frame=1;

        currentScore=currentScore+100;
        this.scoreText.text = currentScore;
        amountDiamond+=1;
        if(amountDiamond==AMOUNT_DIAMONDS){
            game.time.events.remove(this.timerGameOver);
            this.endGame=true;
            this.showFinalMessage('Felicitaciones');
        }
    },
    showFinalMessage:function(msg){
        this.tweenMollusk.stop();
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle='#000016';
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha=0.5;

        var stylesss={
            font: 'bold 60pt Arial',
            fill: '#ffffff',
            align:'center'
        }

        this.txtfinalmsg=game.add.text(game.width/2, game.height/2, msg, stylesss);
        this.txtfinalmsg.anchor.setTo(0.5);
    },
    isOverlapingOtherDiamond:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundsDiamond:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    getBoundsHorse:function(){
        var x0 = this.horse.x-Math.abs(this.horse.width)/4;
        var width = Math.abs(this.horse.width)/2;
        var y0 = this.horse.y-this.horse.height/2;
        var height = this.horse.height;
        return new Phaser.Rectangle(x0, y0, width, height);
    },
    onTap:function(){
        if(!this.flagFirstMouseDown){
            this.tweenMollusk=game.add.tween(this.mollusk.position).to({y:-0.001}, 5000, Phaser.Easing.Cubic.InOut, true, 0, 1000, true).loop(true);
        }
        this.flagFirstMouseDown=true;
    },

    update: function() {
        //update Actualización

        if(this.flagFirstMouseDown && !this.endGame){
            //game.input.x obtiene las coordenadas x y ydel mouse

            if(this.countSmile>=0){
                this.countSmile++;
                if(this.countSmile>50){
                    this.countSmile=-1;
                    this.horse.frame=0;
                }
            }

            for(var i=0; i<AMOUNT_BOOBLES; i++){
                var booble=this.boobleArray[i];
                booble.y-=booble.vel;
                if(booble.y<-50){
                    booble.y=700;
                    booble.x=game.rnd.integerInRange(1, 1140); 
                }
            }

            this.shark.x--;
            if(this.shark.x<-300){
                this.shark.x=1300;
            }

            this.fishes.x+=0.3;
            if(this.fishes.x>1300){
                this.fishes.x=-300;
            }

            pointerX=game.input.x;
            pointerY=game.input.y;
            
            distanciaX=pointerX-this.horse.x;
            distanciaY=pointerY-this.horse.y;

            if(distanciaX>0){
                this.horse.scale.setTo(1);
            }else{
                this.horse.scale.setTo(-1,1);
            }
            this.horse.x+=distanciaX*0.02;
            this.horse.y+=distanciaY*0.02;
        }
        for(var i=0; i<AMOUNT_DIAMONDS; i++){
            var rectHorse = this.getBoundsHorse();
            var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);

            if (this.isRectanglesOverlapping(rectHorse,rectDiamond) && this.diamonds[i].visible){

                this.increaseScore();

                this.diamonds[i].visible=false;

                var explosion = this.explosionGroup.getFirstDead();

                if(explosion!=null){
                    this.increaseScore;
                    explosion.reset(this.diamonds[i].x, this.diamonds[i].y);   
                    explosion.tweenScale.start();
                    explosion.tweenAlpha.start();

                    explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween){
                        currentTarget.kill();
                    }, this);
                    
                }
            }
        }
    },
    //Muetra un recuadro en el sprite pasado como parametro
    render:function(){
        //game.debug.spriteBounds(this.horse);
        for(var i =0; i <AMOUNT_DIAMONDS; i++){
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);
    
game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");