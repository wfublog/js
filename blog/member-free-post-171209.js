﻿var memberSys={};memberSys.t={welcome:"您好，已成功登入會員",welcomeNewMember:"您好，免費加入會員後，即可閱覽隱藏內容",loginMember:"請先加入會員，即可看到隱藏內容",loginFB:"請先登入 Facebook 即可免費加入會員，閱覽隱藏內容",error:"目前伺服器忙碌中，請稍後再試、或重新整理頁面！"};memberSys.postUrl="http://"+location.hostname+location.pathname;memberSys.info={};memberSys.json={};memberSys.history=location.href;memberSys.gif="<img style='vertical-align: middle;' src='https://lh5.googleusercontent.com/-EyVZ0f8J0qQ/UCeEG7aa8nI/AAAAAAAADtY/9sXw53XkYXM/s512/indicator-light.gif'/> ";memberSys.statusChangeCB=function(a){memberSys.response=a;(function(e,f){var c=e.response,g="https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",h="https://script.google.com/macros/s/AKfycbzf10xh92c6aQErRzt2B0PC5_N1uUxbnnDZqprLbXUU3Ob18rQ/exec",d="wm";function b(j){var k=e.info,i=j.name,l=e.postUrl;if(!i){f("#member_message").html(k.name+" "+e.t.welcomeNewMember);f("#member_signUp").show()}else{f("#member_message").html(k.name+" "+e.t.welcome);f("#member_signUp").hide();f.ajax({type:"GET",dataType:"jsonp",jsonpCallback:"aa",data:{method:"queryPost",queryID:j.id,postUrl:l},url:h,success:function(m){console.log("content="+unescape(m));f("#member_free_post").html(unescape(m))}})}}if(c.status==="connected"){memberSys.fbLogout();FB.api("/me",function(i){e.info=i;var j=i.id;if(!j){f("#member_message").html(e.t.error);return}f("#member_icon").attr("src","http://graph.facebook.com/"+j+"/picture").show();f.ajax({type:"GET",dataType:"jsonp",jsonpCallback:"aa",data:{method:"queryMember",query:i.id},url:g,success:function(k){b(k)}})})}else{if(c.status==="not_authorized"){memberSys.fbLogout();f("#member_message").html(e.t.loginMember);f("#member_signUp").show()}else{memberSys.fbLogin();f("#member_message").html(e.t.loginFB)}}})(memberSys,jQuery)};memberSys.checkLoginState=function(){FB.getLoginStatus(function(a){memberSys.statusChangeCB(a)})};memberSys.fbLogin=function(){$(".fb_logout").hide();$(".fb_login").show()};memberSys.fbLogout=function(){$(".fb_login").hide();$(".fb_logout").show()};$(document).on("click",".fb_login",function(){FB.login(function(a){FB.getLoginStatus(function(b){memberSys.statusChangeCB(b)})},{scope:"public_profile,email"})});$(document).on("click",".fb_logout",function(){FB.logout(function(a){location.reload()})});