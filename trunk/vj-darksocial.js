/*~*~*~*~*~*~*~*~*~ ISSUES
xxxx direct overrides; campaign poisoning
events not firing
generation calc'd but not passed
repackCMP not handling various combos properly - in progress

*~*~*~*~*~*~*~*~*/

var _gaq = _gaq||[];

function _darksocial(state){
    //setup
    var visitr;
    var oHash;
    _gaq.push(['_trackEvent', 'testevent', 'testact', 'testlbl', 0, 1]);
    
    //regardless of state, we need visitor id, so let's get it now
    visitr = __getId(); 
    
    //set visitor id in slot 4 (as in who this is "for"), set cv as visitor level
    _gaq.push(['_setCustomVar', 4, 'v', visitr, 1]);
    
    //switch based on state
    switch(state){
	case 'init':
	    //not implemented
	    
	    break;
	case 'exec':
	    
	    //we don't want to override anything but direct; rehash in all cases
	    if(__isDirect()){
		
		//if share is true, test hash, then log (repackCmp) and rehash; otherwise just rehash (doOrigin).
		if(__hasShare()){
		    oHash = __unpackHash();
		    if(oHash[0]!=visitr && oHash[1]!=visitr){
			
			//set category as the originator, action as the sharer, label as the generation  -   _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
			_gaq.push(['_trackEvent', oHash[0], oHash[1], eval(oHash[2])+1, 0, 1]);
			
			//set the source to origin [0] and the campaign to the referrer/sharer [1]
			__repackCmp(oHash[0],oHash[1],'darksocial');
			
			//reset the hash with the origin intact, visitor id, and increment generation
			__repackHash(oHash[0],visitr,eval(oHash[2])+1);
			
		    }else{
			//looked like a share, but includes the sharer;
			//does this indicate some sort of local retrieval (e.g.:history or bookmark?)
			//history will increment the generation each time, bookmark will show the same generation
		    }
		}else{
		    __doOrigin(visitr);
		    
		    //set the source as visitr, but leave the rest of the cookie alone
		    __repackCmp(visitr);
		}
	    }else{
		 __doOrigin(visitr);		
	    }
	    break;
	default:
	    //not implemented, do nothing
    }
}
function __isDirect(){
    // need to prevent darksocial poisoning  - test document.referrer.length  then kill utmz, allow trackPV to rebuild
    var cky = '__utmz';
    cky = __eat(cky, 1);
    if(document.referrer.length==0){  //not enough that they are 'direct' this time, we want to protect previous campaigns (if any)
	if(( cky.indexOf('darksocial')!=-1 || cky.indexOf('md=(none)')!=-1 )){
	    console.log('referrer 0; indexOf true');
	    return true;
	}else{
	    console.log('referrer 0; indexOf false');
	    return false;
	}
    }else{
	//kill utmz if has darksocial, otherwise let it ride
	if((cky.indexOf('darksocial'))!=-1){
	    document.cookie = encodeURIComponent(cky) + "=deleted; expires=" + new Date(0).toUTCString();
	    console.log('referrer 1; tried to kill');
	    __repackCmp('(direct)','(direct)','(none)');
	}
	return false;
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
function __doOrigin(visitr){
    //visitor is the originator, the sharer, and the first generation
    __repackHash(visitr,visitr,1);
    
    //set the originating visitor event
    _gaq.push(['_trackEvent', visitr, visitr, 1, 0, 1]);
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
    if (__eat(cky) === 0){
	return false;
    }else{
	    ret = ret.split('.');
	    return ret[1];		
    }
}
function __repackCmp(src,cmp,med){ //3 args required, max 5, vals other than FALSE will override
    var cky = '__utmz';
    var str;
    var pre;
    var parms = ['utmcsr','utmccn','utmcmd','utmctr','utmcct']; //0=src 1=cmp 2=medium 3=keyword? 4=content
    var ret = __eat(cky,1);
    if (__eat(cky) === 0){
	return false;
    }else{
	ret = ret.split('.');
	//1.1352580680.1.1.utmcsr=%source%|utmccn=%campaignname%|utmcmd=%medium%|utmctr=%keyword%|utmcct=%content%
	pre = ret[0] +'.'+ ret[1] +'.'+ ret[2]  +'.'+ ret[3] +'.';
	//campaign is ret[4]
	ret = ret[4].split('|');
	
	if(ret.length==4 && ret[3].indexOf('utmcct')){
	    parms[3] = 'utmcct'; //keyword is not present
	}
	for(i=0;i<arguments.length;i++){
	    ret[i] = (arguments[i]==false) ? ret[i] : parms[i]+'='+arguments[i];
	}
	str=ret[0]
	for(i=1;i<ret.length;i++){
	    str += '|'+ret[i];
	}
	
	__bake("__utmz", pre+str, 365);
	return true;
    }    
}
















