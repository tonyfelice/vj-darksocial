function _darksocial(state){
    //setup
    var visitr;
    var oHash;
    
    
    //switch based on state
    switch(state){
	case 'init':
	    //test URL for share characteristics, and if present set init param true; set MEDIUM to darksocial and pop
	    if(__hasShare()){
		__repackCmp(false,false,'darksocial');
    	    }
	    break;
	case 'exec':
	    //regardless of share state, we need visitor id, so let's get it now
	    visitr = __getId();
	    
	    //if share is true, test hash, then track event, and repack hash; otherwise just repack. 
	    if(__hasShare()){
		oHash = __unpackHash();
		if(oHash[0]!=visitr && oHash[0]!=visitr){
		    //set category as the originator, action as the sharer, label as the generation  -   _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
		    _gaq.push(['_trackEvent', oHash[0], oHash[1], eval(oHash[2])+1, 0, 1]);
		    //set the campaign to origin [0] and the source to the referrer/sharer [1]
		    __repackCmp(oHash[0],oHash[1],'darksocial');
		    //reset the hash with the origin intact, visitor id, and increment generation
		    __repackHash(oHash[0],visitr,eval(oHash[2])+1);
		}else{
		    //looked like a share, but includes the sharer; do nothing
		}
	    }else{
		//visitor is the originator, the sharer, and the first generation
		__repackHash(visitr,visitr,1);
		//set the originating visitor event
		_gaq.push(['_trackEvent', visitr, 0, 1, 0, 1]);
	    }
	    break;
	default:
	    //not implemented, do nothing
    }
}
function __hasShare(){
    //format: originator.sharer.gen
    if(location.hash && location.hash.match(/\#[0-9]+\.[0-9]+\.[0-9]+/)){
	return true;
    }else{
	return false;
    }
}
function __unpackHash(){
    var oHash = location.hash;
    oHash = oHash.substring(1,oHash.length);
    oHash = oHash.split('.');
    return oHash;
}
function __repackHash(a,b,c){
    window.location.hash = a +'.'+ b +'.'+ c;
}
function __eat(cky) {
	var boo = 0;
	var dat = '';
	var jar = document.cookie.split(';');
	cky = cky+"=";
	for (var i=0;i<jar.length;i++){
		while (jar[i].charAt(0)==' ') jar[i] = jar[i].substring(1,jar[i].length);
		if (jar[i].indexOf(cky) == 0){
			boo = 1;
			dat = jar[i].substring(cky.length, jar[i].length);
		}
	}
	return (arguments.length == 2) ? dat : boo;
}
function __bake(name, value, days) {
    var date = new Date;
    date.setTime(date.getTime() + (typeof days != "undefined" ? days : 3) * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + ("=" + value + expires + "; path=/; domain=." + document.domain);
}
function __getId(){
	var cky = '__utma';
	var ret = __eat(cky,1);
	var tmp = false;
	if (__eat(cky) === 0){return tmp;}else{
		ret = ret.split('.');
		return ret[1];		
	}
}
function __repackCmp(src,cmp,med){
    var cky = '__utmz';
    var str;
    var pre;
    var ret = __eat(cky,1);
    var boo = false;
    if (__eat(cky) === 0){return tmp;}else{
	ret = ret.split('.');
	//190377836.1352416169.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)
	pre = ret[0] +'.'+ ret[1] +'.'+ ret[2]  +'.'+ ret[3] +'.';
	//campaign is ret[4]
	ret = ret[4].split('|');
	//0=src 1=cmp 2=medium
	ret[0] = (src==false) ? ret[0] : 'utmcsr='+src;
	ret[1] = (cmp==false) ? ret[1] : 'utmcsr='+cmp;
	ret[2] = (med==false) ? ret[2] : 'utmcsr='+med;
	str=ret[0]+'|'+ret[1]+'|'+ret[2];
	__bake("__utmz", pre+str, 365);
	boo = true;
    }
    return boo;
}