


module.exports = function(RED) {
    function IoBoardNode(config) {
        var relayState = {
            RLY1:"",RLY2:"",RLY3:"",RLY4:"",RLY5:""
        };
        RED.nodes.createNode(this,config);
        this.board = config.board;
        this.MAC = config.MAC;
		this.input = config.input;
        this.state = config.state;

        var node = this;
        this.on('input', function(msg) {

        	var state = node.state;
        	var board = node.board;
            var input = node.input;
        	var MAC = node.MAC;
            
            if(msg.payload.MAC !== MAC && msg.payload.device !== board) return;
            
            const {device,temp,status} = msg.payload
            if(msg.serverType === "listening"){
                
                if(state=="BUTTON"){
                    if((input==="any" && msg.payload.deviceShadow.buttonTrigger!=0)|| input == msg.payload.deviceShadow.buttonTrigger){
                        if(msg.payload.hasOwnProperty("deviceShadow.buttonState")){
                            msg.payload.deviceShadow.buttonState = msg.payload.deviceShadow.buttonState==="high"? "high":"low"
                        }
                    }else{
                        return;
                    }  
                }else{
                    if(input==="any"){
                        var breakIsTrue = false;
                        for (var i = 1; i <= 5; i++){
                            if(relayState["RLY"+i] !== msg.payload.deviceShadow.relayState["RLY"+i]){
                                relayState["RLY"+i] = msg.payload.deviceShadow.relayState["RLY"+i]
                                breakIsTrue = true;
                            }
                            
                        }
                        
                        // console.log(msg.payload.deviceShadow.relayState)
                        if(!breakIsTrue){return;}

                    }else if(relayState["RLY"+input] !== msg.payload.deviceShadow.relayState["RLY"+input]){
                        relayState["RLY"+input] = msg.payload.deviceShadow.relayState["RLY"+input]
                    }else{
                        return;
                    }  
                }
            }else if(msg.serverType === "createResponce"){
                if(!msg.payload.hasOwnProperty("result")) return;
                if(msg.payload.result !== "success") return;
                const deviceShadow = {relayState : {RLY1:"",RLY2:"",RLY3:"",RLY4:"",RLY5:""}};
                msg.payload = {...msg.payload,deviceShadow}

                for (var i = 1; i <= 5; i++){
                    msg.payload.deviceShadow.relayState["RLY"+i] = msg.payload.data["RLY"+i];
                }

                if(state==="RELAY"){
                    if(input==="any"){
                        var breakIsTrue = false;
                        for (var i = 1; i <= 5; i++){
                            if(relayState["RLY"+i] !== msg.payload.deviceShadow.relayState["RLY"+i]){
                                relayState["RLY"+i] = msg.payload.deviceShadow.relayState["RLY"+i]
                                breakIsTrue = true;
                            }
                        }
                        if(!breakIsTrue){return;}

                    }else if(relayState["RLY"+input] !== msg.payload.deviceShadow.relayState["RLY"+input]){
                        relayState["RLY"+input] = msg.payload.deviceShadow.relayState["RLY"+input]
                    }else{
                        return;
                    }  
                }else{
                    return;
                }
            }else{
                return;
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("IO-Board-Input",IoBoardNode);
}