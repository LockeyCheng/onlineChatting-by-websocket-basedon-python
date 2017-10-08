//by lockey23 2017/10/08
(function(){
	var socket;
	function connect() {
		var host = "ws://192.168.0.33:8899";
		socket = new WebSocket(host);
		try {
			socket.onopen = function (msg) {
				$('#tipsDiv').html('<h4 class="ok">服务器连接成功！</h4>').hide(5000)
			};
			socket.onmessage = function (msg) {
				if (typeof msg.data == "string") {
					dataObj = JSON.parse(msg.data);
					var retType = dataObj.type;
					
					switch(retType)
					{
					case 'login':
					
						if(dataObj.status == 0){
								var tips = '<h4 class="ok">登录成功！</h4>';
								$('#floatDiv').fadeOut(500);
								$('.display_name').html(username);
								msgArray = dataObj.toRead
								console.log(typeof(msgArray))
								console.dir(msgArray)
								/*
								for(i in msgArray){
									var msgObj = JSON.parse(msgArray[i]);
									var id='#'+msgObj.from;
									if($(id).length > 0){
										var origNo = $(id).find('.msgNo').text()
											if (origNo >= 99 || origNo == '99+'){var addedNo = '99+'}
											else{var addedNo = origNo*1+1}
										$(id).find('.msgNo').html(addedNo).show();
									}else{
										var infoCome='<div class="ng-scope" id="'+msgObj.from+'"><div class="top-placeholder ng-scope" style="height: 0px;"></div><div  class="ng-scope"><div class="chat_item slide-left ng-scope top" ><div class="ext"><p class="attr ng-binding"></p></div><div class="avatar"><i class="fa fa-user-circle"></i></div><div class="info"><h3 class="nickname"><span class="nickname_text ng-binding" ng-bind-html="chatContact.getDisplayName()">'+msgObj.from+'</span><span class="msgNo">1</span></h3></div></div></div></div>'
										$('#chatList').append(infoCome)
									}
								}
								*/
						}else if(dataObj.status == 1){
							var tips = '<h4 class="error">用户名或者密码不正确，请重试！</h4>';	
						}else if(dataObj.status == 2){
							var tips = '<h4 class="error">用户已经登录，不可重复登录！</h4>';
						}else{
							var tips = '<h4 class="error">服务器异常，请稍后重试</h4>';	
						}
						$('#tipsDiv').html(tips).show().fadeOut(2000)
					break;
					
					case 'reg':
					
						if(dataObj.status == 0){
							$('#tipsDiv').html('<h4 class="ok">注册成功！</h4>').show().hide(1000)
							$('#floatDiv').fadeOut(500);
							$('.display_name').html(username);
						}else if(dataObj.status == 1){
							$('#tipsDiv').html('<h4 class="ok">用户已经存在，请直接登录！</h4>').show().fadeOut(3000)
						}else{
							console.log('register unknow fallback')
						}
					break;
					
					case 'addgroup':
					
						if(dataObj.status == 0){
							alert('群组添加成功！');
							$('#floatDiv').hide();
						}else if(dataObj.status == 1){
							alert('群组已经存在！')
						}else{
							console.log('addgroup unknow fallback')
						}
					break;
					
					case 'addFriend':
					
						if(dataObj.status == 0){
							alert('好友添加成功！');
						}else if(dataObj.status == 1){
							alert('对方已经是你的好友！')
						}else{
							console.log('addgroup unknow fallback')
						}
					break;
					
					case 'getFriends':
					
						if(dataObj.status == 0){
							fStr = '';
							flist = dataObj.list
							for(friend in flist){
								fStr += '<div class="ng-scope"><div class="top-placeholder ng-scope" style="height: 0px;"></div><div  class="ng-scope"><div class="chat_item slide-left ng-scope top" ><div class="ext"><p class="attr ng-binding"></p></div><div class="avatar"><i class="fa fa-user-circle"></i></div><div class="info"><h3 class="nickname"><span class="nickname_text ng-binding" data="personal" ng-bind-html="chatContact.getDisplayName()">'+flist[friend]+'</span></h3></div></div></div></div>'
							}
							if(fStr == ''){
								fStr = '<h5 style="text-align:center;color:#ffd484">您还没有添加朋友！</h5>'
							}
							$('#addressList').html(fStr)
						}else if(dataObj.status == 1){
								alert('获取好友列表失败！')
						}else{
							console.log('addgroup unknow fallback')
						}
					break;
					
					case 'getGroups':
					
						if(dataObj.status == 0){
							fStr = '';
							flist = dataObj.list
							for(friend in flist){
								fStr += '<div class="ng-scope"><div class="top-placeholder ng-scope" style="height: 0px;"></div><div  class="ng-scope"><div class="chat_item slide-left ng-scope top" ><div class="ext"><p class="attr ng-binding"></p></div><div class="avatar"><i class="fa fa-user-circle"></i></div><div class="info"><h3 class="nickname"><span class="nickname_text ng-binding" data="group" ng-bind-html="chatContact.getDisplayName()">'+flist[friend]+'</span></h3></div></div></div></div>'
							}
							if(fStr == ''){
								fStr = '<h5 style="text-align:center;color:#ffd484" class="someShouldEmpty">您不属于任何一个群组！</h5>'
							}
							$('#groupop .someShouldEmpty').remove();
							$('#groupop').append(fStr)
						}else if(dataObj.status == 1){
								alert('获取群组列表失败！')
						}else{
							console.log('获取群组列表 unknow fallback')
						}
					break;
					
					case 'enterGroup':
					
						if(dataObj.status == 0){
									alert('申请入群成功！');
						}else if(dataObj.status == 1){
								alert('你已经是群成员了！')
						}else{console.log('addgroup unknow fallback')}
					break;
					
					case 'search':
					
						groups = dataObj.groups
						persons = dataObj.persons
						console.log(typeof(groups),groups,typeof(persons),persons)
						gStr='';pStr='';
						for(g in groups){
							gStr+= '<div  class="ng-scope search-scope"><div ng-style="{height:topHeight}" class="top-placeholder ng-scope" style="height: 0px;"></div><div ng-repeat="chatContact in chatList track by chatContact.UserName" class="ng-scope"><div class="chat_item slide-left ng-scope top "><span class="name">'+groups[g]+'</span><span class="resultType">group</span></div></div></div>'
						}
						for(p in persons){
							pStr+= '<div  class="ng-scope search-scope"><div ng-style="{height:topHeight}" class="top-placeholder ng-scope" style="height: 0px;"></div><div ng-repeat="chatContact in chatList track by chatContact.UserName" class="ng-scope"><div class="chat_item slide-left ng-scope top"><span class="name">'+persons[p]+'</span><span class="resultType">personal</span></div></div></div>'
						}
						appendStr = gStr+pStr;
						$('#searchResult').html(appendStr)
					break;
					
					case 'personal':
					
						$('#chatList .showEmpty').remove();
						var currentUser = $('#chatArea .title_name').text();
						if( currentUser == dataObj.from){
						
							msgFrom ='<div  class="ng-scope"><div class="clearfix"><divstyle="overflow: hidden;" ><div  class="message ng-scope you" ><div  class="message_system ng-scope"><div  class="content ng-binding ng-scope">'+dataObj.time+'</div></div><img class="avatar" src="images/head.png"><div class="content"><div class="bubble js_message_bubble ng-scope bubble_primary right"><div class="bubble_cont ng-scope"><div class="plain"><pre class="js_message_plain ng-binding" ng-bind-html="message.MMActualContent">'+dataObj.msg+'</pre></div></div></div></div></div></div></div></div>';
							$('#msgContent').prepend(msgFrom);
						}
						else{
							$('.commentsTips').css('visibility','visible')
							var id='#'+dataObj.from;
							var chatType = dataObj.type
							if($(id).length > 0){
								var origNo = $(id).find('.msgNo').text()
								if (origNo >= 99 || origNo == '99+'){var addedNo = '99+'}
								else{var addedNo = origNo*1+1}
								$(id).find('.msgNo').html(addedNo).show();
							}else{
								unRead[dataObj.from]=[]
								var infoCome='<div class="ng-scope" id="'+dataObj.from+'"><div class="top-placeholder ng-scope" style="height: 0px;"></div><div  class="ng-scope"><div class="chat_item slide-left ng-scope top" ><div class="ext"><p class="attr ng-binding"></p></div><div class="avatar"><i class="fa fa-user-circle"></i></div><div class="info"><h3 class="nickname"><span class="nickname_text ng-binding" data="'+chatType+'" ng-bind-html="chatContact.getDisplayName()">'+dataObj.from+'</span><span class="msgNo">1</span></h3></div></div></div></div>'
								$('#chatList').append(infoCome)
							}
							unRead[dataObj.from].push(dataObj)
							
						}
					break;
					
					case 'group':
					
						$('#chatList .showEmpty').remove();
						if(dataObj.from == username){
						 return false
						}
						var currentUser = $('#chatArea .title_name').text();
						if( currentUser == dataObj.to){
							msgFrom ='<div  class="ng-scope"><div class="clearfix"><divstyle="overflow: hidden;" ><div  class="message ng-scope you" ><div  class="message_system ng-scope"><div  class="content ng-binding ng-scope">'+dataObj.time+'('+dataObj.from+')</div></div><img class="avatar" src="images/head.png"><div class="content"><div class="bubble js_message_bubble ng-scope bubble_primary right"><div class="bubble_cont ng-scope"><div class="plain"><pre class="js_message_plain ng-binding" ng-bind-html="message.MMActualContent">'+dataObj.msg+'</pre></div></div></div></div></div></div></div></div>';
							$('#msgContent').prepend(msgFrom);
						}
						else{
							$('.commentsTips').css('visibility','visible')
							var id='#'+dataObj.to;
							var chatType = 'group'
							if($(id).length > 0){
								var origNo = $(id).find('.msgNo').text()
								if (origNo >= 99 || origNo == '99+'){var addedNo = '99+'}
								else{var addedNo = origNo*1+1}
								$(id).find('.msgNo').html(addedNo).show();
							}else{
								unRead[dataObj.to]=[]
								var infoCome='<div class="ng-scope" id="'+dataObj.to+'"><div class="top-placeholder ng-scope" style="height: 0px;"></div><div  class="ng-scope"><div class="chat_item slide-left ng-scope top" ><div class="ext"><p class="attr ng-binding"></p></div><div class="avatar"><i class="fa fa-user-circle"></i></div><div class="info"><h3 class="nickname"><span class="nickname_text ng-binding" data="group" ng-bind-html="chatContact.getDisplayName()">'+dataObj.to+'</span><span class="msgNo">1</span></h3></div></div></div></div>'
								$('#chatList').append(infoCome)
							}
							unRead[dataObj.to].push(dataObj)
							
						}
					break;
					default:
					  alert('服务器异常或者请求失败，请稍后重试！');
					}
				}else{
					console.log("非文本消息");
					console.log(msg.data);
				}
				};

				socket.onclose = function (msg) {
				  $('#tipsDiv').html('<h4 class="error">服务器异常，请刷新页面重试！</h4>').show();
				  };
		}catch (ex) {
			log(ex);
		}
	}
	function send() {
		var msg = $('#editArea').text();
		if (!msg){
			if($('#warnEmpty')){
				$('#warnEmpty').remove();
			}
			$('#tool_bar').append('<span style="margin-left:221px;color:red" id="warnEmpty">发送信息不能为空！</span>');$('#warnEmpty').fadeOut(3600);
			return false;
		}
		var times = new Date().Format("yyyy/MM/dd hh:mm:ss")
		msgstrTo ='<div  class="ng-scope"><div class="clearfix"><divstyle="overflow: hidden;" ><div  class="message ng-scope me" ><div  class="message_system ng-scope"><div  class="content ng-binding ng-scope">'+times+'</div></div><img class="avatar" src="images/git.png"><div class="content"><div class="bubble js_message_bubble ng-scope bubble_primary right"><div class="bubble_cont ng-scope"><div class="plain"><pre class="js_message_plain ng-binding" ng-bind-html="message.MMActualContent">'+msg+'</pre></div></div></div></div></div></div></div></div>';
		$('#msgContent').prepend(msgstrTo);
		var chatType = $('#chatArea .title_name').attr('data');
		msg = {'type':chatType,'from':username,'to':$('#chatArea .title_name').text(),'msg':msg,'time':times};
		msg = JSON.stringify(msg)
		socket.send(msg);
	}

	window.onbeforeunload = function () {
		try {
			alert(1)
			socket.close();
			socket = null;
		}
		catch (ex) {
		}
	};
	Date.prototype.Format = function (fmt) { //author: meizz
		var o = {
			"M+": this.getMonth() + 1, //月份
			"d+": this.getDate(), //日
			"h+": this.getHours(), //小时
			"m+": this.getMinutes(), //分
			"s+": this.getSeconds(), //秒
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度
			"S": this.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	function onkey(event) { if (event.keyCode == 13) { send(); } }
	$('#btn_send').click(function(){send();})
	$('#login #password').focus(function() {
		$('#owl-login').addClass('password');
	}).blur(function() {
		$('#owl-login').removeClass('password');
	});
	$('.logreg').click(
		function(){
			username = $('#email').val();
			password = $('#password').val();
			if(!username){
				$('#tipsDiv').html('<h4 class="error">用户名不符合规范！</h4>').show().fadeOut(5000);
				return false;
			}
			if(!password){
				$('#tipsDiv').html('<h4 class="error">密码不符合规范！</h4>').show().fadeOut(5000);
				return false;
			}
			if ($(this).text() == 'Register'){
				passwordConfirm = $('#passwordConfirm').val();
				if (passwordConfirm != password){
					$('#tipsDiv').html('<h4 class="error">密码不一致！</h4>').show().fadeOut(5000);
					return false;
				}else{
					msg={'type':'reg','username':username,'password':password}
				}
			}else{
				msg={'type':'login','username':username,'password':password}
			}
			msg=JSON.stringify(msg);//JSON.parse(json_str);
			socket.send(msg);
		});
	$("#panel").on("click",".chat_item",function(){
		$('.commentsTips').css('visibility','hidden')
		$('#editArea').attr('contenteditable',true);
		var nickname = $(this).find('.nickname_text').text();
		var chatType = $(this).find('.nickname_text').attr('data')
		$('#chatArea .title_name').html(nickname).attr('data',chatType);
		$('#msgContent').empty()
		if($(this).find('.msgNo').length > 0){
		$(this).find('.msgNo').html(0).hide()
		msgFrom = '';
		arr = unRead[nickname]
		for(m in arr){
			showCome = '';
			if(chatType == 'group'){showCome = '('+arr[m].from+')';}
			msgFrom += '<div  class="ng-scope"><div class="clearfix"><divstyle="overflow: hidden;" ><div  class="message ng-scope you" ><div  class="message_system ng-scope"><div  class="content ng-binding ng-scope">'+arr[m].time+showCome+'</div></div><img class="avatar" src="images/head.png"><div class="content"><div class="bubble js_message_bubble ng-scope bubble_primary right"><div class="bubble_cont ng-scope"><div class="plain"><pre class="js_message_plain ng-binding" ng-bind-html="message.MMActualContent">'+arr[m].msg+'</pre></div></div></div></div></div></div></div></div>';
		}
		$('#msgContent').append(msgFrom);
		}
	})
	$('.signupin').click(function(){
		var text = $(this).text()
		$(this).hide()
		if (text == 'Sign Up'){
			$(this).next().show()
			$('#passConfirm').show()
			$('#loginBtn').hide()
			$('#regBtn').show()
		}else{
			$(this).prev().show()
			$('#passConfirm').hide()
			$('#loginBtn').show()
			$('#regBtn').hide()
		}
	})
	$('#logout').click(function(){
	$('#floatDiv').css('opacity','0.9')
	$('#floatDiv').show();
	$('#loginform').html('<div style="padding: 26px;"><h3 style="color:#ff3f13;text-align:center">确认要退出?</h3><br/><h4 align="center"><button type="button" tabindex="4" class="btn btn-primary outCacel">取消</button><button type="button" tabindex="4" class="btn btn-primary" id="outYes">退出</button></h4></div>')
	$('.outCacel').click(function(){$('#floatDiv').hide();});
	$('#outYes').click(function(){
		msg={'type':'quit','username':username}
		msg=JSON.stringify(msg);//JSON.parse(json_str);
		socket.send(msg);
		location.reload(true)
	});
	});
	$('#searchJoin').click(function(){
		var keys = $('#joinInput').val();
		if(!keys){
				
				$('#joinInput').css('border','solid 1px red');
				var setNone = setTimeout(function(){$('#joinInput').css('border','none');},2600);
				return false;
			}
				msg={'type':'search','username':username,'keywords':keys}
				msg=JSON.stringify(msg);//JSON.parse(json_str);
				socket.send(msg);
				$('.operations').hide()
				$('#searchResult').show()
	})
	$('.fa-comments').click(function(){
		$('.operations').hide()
		$('#chatList').show()
		$('.commentsTips').css('visibility','hidden')
	})
	$('.fa-group').click(function(){
		$('.operations').hide()
		$('#groupop').show()
		msg={'type':'getGroups','username':username}
		msg=JSON.stringify(msg);
		socket.send(msg);
		
	})
	$('.fa-address-book').click(function(){
		msg={'type':'getFriends','username':username}
		msg=JSON.stringify(msg);
		socket.send(msg);
		$('.operations').hide()
		$('#addressList').show()
	})
	$('#addGroup').click(function(){
		$('#floatDiv').css('opacity','0.9')
		$('#floatDiv').show();
		$('#loginform').html('<h3 style="text-align: center;color:olive;padding-top: 26px;">添加群组</h3><br/><div class="control-group"><div class="controls" style="margin-left: 16%;">群组名称： <input id="Gname" type="text" name="email"  tabindex="1" autofocus="autofocus" class="form-control input-medium" style="width:68%;display:inline"></div></div><div class="control-group"><div class="controls" style="margin-left: 16%;">组座右铭： <input id="Gmotto" type="text" name="email" tabindex="1" autofocus="autofocus" class="form-control input-medium" style="width:68%;display:inline"></div></div><h5 style="margin-left:16%">成员选择： <select id="memberSlect" style="width: 68%;height: 40px;font-size: 14px;vertical-align: middle;border: 1px solid #cccccc;border-radius: 4px;"><option value="lockey1">lockey1</option><option value="lockey2">lockey2</option></select></h5><textarea id="groupMembers" style="margin-left:16%;width: 76%;">'+username+',</textarea><h4 align="center"><button type="button" tabindex="4" class="btn btn-primary outCacel">取消</button><button type="button" tabindex="4" class="btn btn-primary" id="groupAddYes">添加</button></h4><br/>')
		$('#memberSlect').mouseleave(function(){
			var mem = $(this).val();
			var choosed = $('#groupMembers').text();
			if (!choosed.match(mem)){
				$('#groupMembers').append(mem+',');
			}
		})
		$('.outCacel').click(function(){$('#floatDiv').hide();});
		$('#groupAddYes').click(function(){
			var groupName = $('#Gname').val()
			var groupMotto = $('#Gmotto').val()
			var groupMems = ($('#groupMembers').val()).slice(0,-1)
			msg={'type':'addgroup','groupName':groupName,'groupMotto':groupMotto,'groupMems':groupMems,'username':username}
			msg=JSON.stringify(msg);
			socket.send(msg);
		});
	})
	$("#searchResult").on("mouseenter",".search-scope",function(){
	if($(this).find('span.name').text() == username){return false;}
		$(this).find('span.name').after('<i class="fa fa-plus-square-o addFriGrp"></i>');
	}).on("mouseleave",".search-scope",function(){
		$(this).find('.fa-plus-square-o').remove();
	})
	$("#searchResult").on('click','.addFriGrp',function(){
		var name = $(this).prev().text()
		var type = $(this).next().text()
		if (type == 'group'){
			var realtype = 'enterGroup';
		}else{
			var realtype = 'addFriend';
		}
		msg={'type':realtype,'username':username,'target':name}
		msg=JSON.stringify(msg);
		console.log(msg)
		socket.send(msg);
	})
	connect();
})();