/* 基本共用程式碼 start */
var memberSys = window.memberSys || {};

// 網站名稱
memberSys.blogName = "WFU BLOG";

// 會員系統項目
memberSys.p = {
	info: "會員資訊",
	announce: "會員公告",
	comment: "會員討論區",
	free: "會員限定文章",
	value: "會員加值文章",
	consume: "點數使用明細"
};

// 會員系統訊息
memberSys.t = {
	wait: "請稍待...",
	waitVerify: "請稍後，正在驗證會員資料...",
	welcome: "您好，歡迎使用 " + memberSys.blogName + " 會員中心",
	welcomeNewMember: "您好，歡迎註冊 " + memberSys.blogName + " 會員，成為會員後即可使用會員中心各項功能",
	loginMember: "請加入 " + memberSys.blogName + " 會員",
	loginFB: "請先登入 Facebook 來加入/登入會員",
	newMemberSubmit: "確定資料無誤後，按下「送出資料」按鈕即可完成註冊！",
	done: "感謝註冊會員資料，您已取得閱覽「會員限定文章」之資格。<p/>" + (memberSys.history ? "如您從「會員限定文章」來到此頁面，可按此 <input class='member_button' style='margin-top: 0px;' onclick='location.href=\"" + memberSys.history + "\"' value='回到上一頁' type='button'>" : ""),
	notDone: "您的資料已送出，但尚未填寫完整！若下次能完整填寫資料，即可進行審核。",
	updateInfo: "感謝您更新資料",
	error: "目前伺服器忙碌中，請稍後再試、或重新整理頁面！",
	name: "姓名",
	sex: "性別",
	mail: "信箱",
	birthday: "生日",
	phone: "電話",
	address: "地址",
	register: "註冊",
	update: "更新",
	serial: "編號",
	defaultMember: "一般會員"
};

// 會員系統項目網址
memberSys.u = {
	center: "/p/wfublog-member-center.html",
	announce: "/p/member-announce.html",
	comment: "/p/member-comment.html",
	free: "/p/member-free-post.html",
	value: "/p/member-value-post.html",
	consume: "/p/member-point-detail.html"
};

// 會員 FB 基本資訊
memberSys.info = {};
memberSys.json = {};
memberSys.gif = "<img style='vertical-align: middle;' src='https://lh5.googleusercontent.com/-EyVZ0f8J0qQ/UCeEG7aa8nI/AAAAAAAADtY/9sXw53XkYXM/s512/indicator-light.gif'/> ";
memberSys.run = memberSys.run || 0; // 檢查會員系統是否已經啟動, 很奇怪動態載入時, 會員系統似乎會被連續載入兩次, 所以要這麼設定

// 初始等候訊息
$("#member_message").html(memberSys.gif + memberSys.t.waitVerify);

memberSys.statusChangeCB = function(response) {
	memberSys.response = response;

	// 會員中心-主程式
	(function(ms, $) {
		// 讀入 login 狀態
		var response = ms.response,

			// 網路應用程式網址
			webAppUrl = "https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",

			// http 請求密碼
			password = "wm";

		// 主程式
		function main(json) {
			var info = ms.info,
				name = json.name,
				total = json.total, // 會員總數
				point = json.point, // 會員點數
				urlCode = top.location.href.match(/code\=\w+[^&]/),
				pageCode;

			ms.json = json;

			// 顯示會員總數
			$("#member_total").html("<img src='http://3.bp.blogspot.com/-Kn6mIhH8gyM/VEhOi6wlBGI/AAAAAAAAKWM/0fQradHo-qU/h18/member_head.png'/> " + total);

			// 處理點數
			if (point) {
				handlePoint(point);
			}

			// 分解 page 參數
			urlCode = urlCode ? urlCode[0].split("=")[1] : "";

			// 沒註冊過的話 強制執行註冊
			if (!name) {
				$("#member_message").html(info.name + " " + ms.t.welcomeNewMember);
				ms.showFBinfo();
			} else {
				// 歡迎訊息
				$("#member_message").html(info.name + " " + ms.t.welcome);

				// 取出 pageCode, 根據對應的字串執行會員分頁
				pageCode = urlCode || "info";
				ms.init(pageCode);
				// 已註冊，所有按鈕才加上 onclick
				ms.click();
			}
		}

		// 處理點數
		function handlePoint(point) {
			var html = "";
			html += "現有點數 " + "<span class='member_point_value'>" + point + "</span> 點 ";
			html += "<span id='member_addValue' class='buttonBlue buttonAll'>立即加值 💰</span>";
			$("#center_point_message").html(html);
			// 按下立即加值
			$("#member_addValue").click(function() {
				$("#member_load").html(ms.gif + ms.t.wait);
				$("#member_load").load("/2015/01/member-buynow-instruction.html #addValue_instruction", function() {
					$("#member_form").show();
				});
			});
		}

		// 登入 FB 且已加入會員
		if (response.status === "connected") {
			FB.api("/me?fields=id,name,email,gender", function(info) {
				ms.info = info;
				var id = info.id;

				// info.id 為 undefined 時，顯示錯誤訊息
				if (!id) {
					$("#member_message").html(ms.t.error);
					return;
				}

				// 顯示頭像
				$("#member_icon").attr("src", "http://graph.facebook.com/" + id + "/picture");

				if (memberSys.run) {
					return; // 中止執行程式
				}
				memberSys.run = 1; // 讓會員系統不要執行第 2 次

				// 查詢試算表會員資料
				$.ajax({
					type: "post",
					data: {
						"password": password,
						"method": "queryMember",
						"query": id
					},
					url: webAppUrl,
					success: function(json) { // 成功時執行主程式
						main(json);
					},
					error: function(e) { // 失敗時顯示錯誤訊息
						console.log(e);
						$("#member_message").html(ms.t.error);
					}
				});
			});
		}
		// 登入 FB, 未偵測到加入會員
		else if (response.status === "not_authorized") {
			$("#member_message").html(ms.t.loginMember);
		}
		// 未登入 FB
		else {
			$("#member_message").html(ms.t.loginFB);
		}
	})(memberSys, jQuery);

};

memberSys.checkLoginState = function() {
	FB.getLoginStatus(function(response) {
		memberSys.statusChangeCB(response);
	});
};

memberSys.scrollTop = function() {
	var top = $("#member_center").offset().top;
	$("html, body").animate({
		scrollTop: top - 90
	}, 500);
	// 順便隱藏表單
	$("#member_form").hide();
};

memberSys.click = function() {
	$("#member_page_info").click(function() {
		memberSys.scrollTop();
		memberSys.showFBinfo();
	});
	$("#member_page_announce").click(function() {
		memberSys.scrollTop();
		memberSys.announce();
	});
	$("#member_page_comment").click(function() {
		memberSys.scrollTop();
		memberSys.comment();
	});
	$("#member_page_free").click(function() {
		memberSys.scrollTop();
		memberSys.free();
	});
	$("#member_page_value").click(function() {
		memberSys.scrollTop();
		memberSys.value();
	});
	$("#member_page_consume").click(function() {
		memberSys.scrollTop();
		memberSys.consume();
	});
};

memberSys.init = function(page) {
	switch (page) {
		case "info":
			memberSys.showFBinfo();
			break;
		case "announce":
			memberSys.announce();
			break;
		case "comment":
			memberSys.comment();
			break;
		case "free":
			memberSys.free();
			break;
		case "value":
			memberSys.value();
			break;
		case "consume":
			memberSys.consume();
			break;
	}
};
/* 基本共用程式碼 end */

memberSys.showFBinfo = function() {
	var ms = memberSys,
		info = ms.info,
		json = ms.json,
		id = info.id,
		leftHtml = "",
		infoHtml = "",
		doneText = "",
		register = json.register && json.register.substr(0, 10), // 取前 10 個字元就好
		level = json.level,
		serial = json.serial,
		name = json.name,
		sex = json.sex,
		email = json.email,
		birthday = json.birthday || "",
		phone = json.phone || "",
		address = json.address || "";

	// 改標題
	$("#member_title").html(ms.p.info);
	// 等待動畫
	$("#member_load").html("<div id='member_left'>" + ms.gif + ms.t.wait + "</div><div id='memeber_info'></div>");

	// 有註冊過的話
	if (name) {
		// 紀錄會員級別
		ms.level = level;
		ms.serial = serial;
		ms.register = register;
	} else { // 沒有 id 的話 進行註冊
		name = info.name;
		sex = info.gender || "";
		email = info.email || "";
		// 第一次註冊提示字串
		doneText = ms.t.newMemberSubmit;
	}

	// 頭像 會員等級 會員編號 註冊時間
	leftHtml += "<img id='member_avatar' src='http://graph.facebook.com/" + id + "/picture'/>";
	leftHtml += "<div>" + name + "</div>";

	if (level) { // 有會員等級則顯示等級
		leftHtml += "<div>" + level + "</div>";
	}

	if (serial) { // 有會員編號則加上字串 "會員編號"
		leftHtml += "<div>" + ms.t.serial + " " + serial + "</div>";
	}

	if (register) {
		leftHtml += "<div>" + ms.t.register + " " + register + "</div>";
	}

	// 會員資料
	infoHtml += "<div><span>" + ms.t.name + "</span>&#12288;<input id='member_name' class='member_input' placeholder='必填' onblur='memberSys.ckName();' maxlength='30' value='" + name + "'/></div>";

	infoHtml += "<div id='member_sex'><span>" + ms.t.sex + "</span>&#12288;<label><input type='radio' name='sex' value='1'/>男生</label> <label><input type='radio' name='sex' value='0'/>女生</label></div>";

	infoHtml += "<div><span>" + ms.t.mail + "</span>&#12288;<input id='member_email' class='member_input' placeholder='必填' type='email' onblur='memberSys.ckEmail();' maxlength='40' value='" + email + "'/></div>";

	// 以下生日 電話 地址為選項
	if (birthday) {
		infoHtml += "<div><span>" + ms.t.birthday + "</span>&#12288;<input id='member_birthday' class='member_input' placeholder='選填' type='date' maxlength='15' value='" + birthday + "'/></div>";
	}
	if (phone) {
		infoHtml += "<div><span>" + ms.t.phone + "</span>&#12288;<input id='member_phone' class='member_input' placeholder='選填' type='tel' maxlength='20' value='" + phone + "'/></div>";
	}
	if (address) {
		infoHtml += "<div><span>" + ms.t.address + "</span>&#12288;<input id='member_address' class='member_input' placeholder='選填' maxlength='100' value='" + address + "'/></div>";
	}

	infoHtml += "<input class='member_button' onclick='$(\"#member_done\").html(memberSys.gif + memberSys.t.wait); memberSys.submit(this);' value='送出資料' type='button'/>";
	infoHtml += "<div id='member_done'>" + doneText + "</div>";
	$("#member_left").html(leftHtml);
	$("#memeber_info").html(infoHtml);
	// 性別按鈕
	if (sex == "male" || sex == "男生") {
		$("#memeber_info input[value=1]").attr("checked", true);
	}
	if (sex == "female" || sex == "女生") {
		$("#memeber_info input[value=0]").attr("checked", true);
	}
};

memberSys.ckName = function() {
	var val = $("#member_name").val().replace(/ /g, "");
	if (!val) {
		$("#member_done").html("請輸入姓名！");
		$("#member_name").css("background-color", "red");
	} else {
		$("#member_done").html("");
		$("#member_name").css("background-color", "#f2f2f2");
		return true;
	}
};

memberSys.ckEmail = function() {
	var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
		val = $("#member_email").val();
	if (val.search(reg) < 0) {
		$("#member_done").html("email 格式不正確，請重新輸入！");
		$("#member_email").css("background-color", "red");
	} else {
		$("#member_done").html("");
		$("#member_email").css("background-color", "#f2f2f2");
		return true;
	}
};

memberSys.ckSex = function(sex) {
	if (!sex) {
		$("#member_done").html("請選擇性別！");
	} else {
		return true;
	}
};

memberSys.submit = function(disable) {
	memberSys.disable = disable;

	// 會員中心-提交
	(function(ms, $) {
		var disable = ms.disable,

			// 網路應用程式網址
			webAppUrl = "https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",

			// http 請求密碼
			password = "wm",

			id = ms.info.id,
			name = $("#member_name").val(),
			sex = $("#member_sex input:checked").val(),
			email = $("#member_email").val(),
			birthday = $("#member_birthday").val() || "",
			phone = $("#member_phone").val() || "",
			address = $("#member_address").val() || "",
			level = ms.level,
			serial = ms.serial,
			register = ms.register,
			fbUrl = "https://www.facebook.com/" + id,

			// 根據是否已經註冊, 決定 method 為新增會員、或更新會員資料
			method = register ? "updateMember" : "addMember";

		// 判別性別
		switch (sex) {
			case "0":
				sex = "女生";
				break;
			case "1":
				sex = "男生";
		}

		level = level || ms.t.defaultMember;

		// email, 姓名, 性別, 無誤 就送出資料
		if (ms.ckEmail() && ms.ckName() && ms.ckSex(sex)) {
			$("#member_done").html(ms.gif + ms.t.wait);
			// 禁止按鈕重複送出
			$(disable)[0].disabled = true;
			ms.click();

			$.ajax({
				type: "post",
				data: {
					"password": password,
					"method": method,
					"register": register,
					"level": level,
					"serial": serial,
					"name": name,
					"sex": sex,
					"email": email,
					"id": id,
					"fbUrl": fbUrl,
					"birthday": birthday,
					"phone": phone,
					"address": address
				},
				url: webAppUrl,
				success: function() { // 成功時執行主程式
					if (!ms.level) { // 新會員的提示訊息
						$("#member_done").html(ms.t.done);
					} else { // 更新資訊的提示訊息
						$("#member_done").html(ms.t.updateInfo);
					}
				},
				error: function(e) { // 失敗時顯示錯誤訊息
					console.log(e);
					$("#member_message").html(ms.t.error);
				}
			});
		}
	})(memberSys, jQuery);

};

// 會員公告
memberSys.announce = function() {
	$("#member_load").html(memberSys.gif + memberSys.t.wait);
	// 改標題
	$("#member_title").html(memberSys.p.announce);
	$("#member_load").load(memberSys.u.announce + " #member_announce");
};

// 會員討論區
memberSys.comment = function() {
	$("#member_load").html(memberSys.gif + memberSys.t.wait);
	// 改標題
	$("#member_title").html(memberSys.p.comment);
	$("#member_load").load(memberSys.u.comment + " #member_comment", function() {
		$(".fb-comments").attr({
			"width": $("#member_center").width() * 0.9,
			"href": memberSys.u.center
		});
		FB.XFBML.parse();
	});
};

// 會員限定文章
memberSys.free = function() {
	$("#member_load").html(memberSys.gif + memberSys.t.wait);
	// 改標題
	$("#member_title").html(memberSys.p.free);

	// 會員中心-會員限定文章
	(function(ms, $) {
		// 網路應用程式網址
		var webAppUrl = "https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",

			// http 請求密碼
			password = "wm";

		// 取得限定文章列表
		function memberPostList(json) {
			var list = json.list,
				html = "<ol>",
				i, entry, url, title;

			for (i in list) {
				entry = list[i];
				url = entry.url;
				title = entry.title;
				html += "<li><a href='" + url + "' target='_blank'>" + title + "</a></li>";
			}
			html += "</ol>";
			$(".member_announce_text").html(html);
		}

		$("#member_load").load(ms.u.free + " #member_free_post", function() {
			// 請求取得限定文章 json
			$.ajax({
				type: "post",
				data: {
					"password": password,
					"method": "memberPostList",
					"query": ms.json.id
				},
				url: webAppUrl,
				success: function(json) {
					memberPostList(json);
				}
			});
		});
	})(memberSys, jQuery);

};

// 會員加值文章
memberSys.value = function() {
	$("#member_load").html(memberSys.gif + memberSys.t.wait);
	// 改標題
	$("#member_title").html(memberSys.p.value);

	// 會員中心-會員加值文章
	(function(ms, $) {
		$("#member_load").load(ms.u.value + " #member_value_post", function() {
			// 網路應用程式網址
			var webAppUrl = "https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",

				// http 請求密碼
				password = "wm";

			// 取得加值文章列表
			function valuePostList(json) {
				var labelSet = ["BLOGGER", "CUSTOM"],
					labelStr = ["Blogger 工具", "客製工具"],
					list = json.list,
					buyedItem = ms.json.item, // 兌換過的 item
					html = "",
					i, j, entry, title, url, pic, label, point, item;

				for (i in labelSet) {
					// 印出分類標題
					html += "<h3>" + labelStr[i] + "</h3><br/>";

					for (j in list) {
						entry = list[j];
						title = entry.title;
						url = entry.url;
						pic = entry.pic;
						label = entry.label;
						point = entry.point;
						item = entry.item;

						// 符合 label 字串才印出 item
						if (label == labelSet[i]) {
							html += "<div class='member_value_item'>";
							html += "<a href='" + url + "' target='_blank'>";
							html += "<img src='" + pic + "'/>";
							html += "<div class='value_item_title'>" + title + "</div>";
							html += "</a>";
							html += "<p class='center'><span>兌換點數：</span>" + point + " ";
							// 如果這個 item 沒兌換過
							if (buyedItem.search(item) < 0) {
								// 印出藍色 "兌換" 按鈕
								html += "<span class='buttonBlue buttonAll center_buyNow' data-label='" + label + "' data-url='" + url + "'>兌換 💰</span>";
							} else { // 已經兌換過的話
								// 印出紅色 "已兌換" 按鈕
								html += "<span class='buttonRed buttonAll center_buyNow'>已兌換</span>";
							}
							html += "</p></div>";
						}
					}
					html += "<br/>";
				}
				$(".member_announce_text").html(html);

				// 監控立即兌換按鈕
				buyNow();
			}

			// 按下立即兌換
			function buyNow() {
				$(".buttonBlue.center_buyNow").click(function() {
					var $this = $(this),
						url = $this.attr("data-url"),
						label = $this.attr("data-label");
					// 如果標籤是 CUSTOM
					if (label == "CUSTOM") {
						// 顯示聯絡表單
						$("#member_form").show();
						// 提醒不能兌換
						alert("此項目需要客製，無法提供現成的程式碼兌換，點數供您報價參考，請用頁面下方的聯絡表單與我聯繫。");
					} else { // 否則前往產品頁面
						window.open(url, "_blank");
					}
				});
			}

			// 取得加值文章 json
			$.ajax({
				type: "post",
				data: {
					"password": password,
					"method": "valuePostList",
					"query": ms.json.id
				},
				url: webAppUrl,
				success: function(json) {
					valuePostList(json);
				}
			});
		});
	})(memberSys, jQuery);

};

memberSys.consume = function() {
	$("#member_load").html(memberSys.gif + memberSys.t.wait);
	// 改標題
	$("#member_title").html(memberSys.p.consume);

	// 會員中心-點數使用明細
	(function(ms, $) {
		// 網路應用程式網址
		var webAppUrl = "https://script.google.com/macros/s/AKfycbyNqokvD7-b7DeyeoZLsJAbywlTEdN5unlegZ78hCg0Czh5jbo/exec",

			// http 請求密碼
			password = "wm",

			// 兌換過的 item
			buyedItem = ms.json.item;

		function buyedPostList(json) {
			var list = json.list,
				buyRecord = buyedItem.split(","),
				html = "",
				urlSet = [],
				titleSet = [],
				itemSet = [],
				usedPoint = 0, // 已使用的點數
				i, entry, url, title, item, point, index;

			// 所有加值文章的 url, title, itemNo 存入陣列
			for (i in list) {
				entry = list[i];
				urlSet.push(entry.url);
				titleSet.push(entry.title);
				itemSet.push(entry.item);
			}

			// loop 兌換記錄
			html += "<ol>";
			for (i in buyRecord) {
				if (!buyRecord[i]) {
					continue;
				}
				// 分解兌換記錄字串, 前半部為 item no, 後半部為兌換點數
				item = buyRecord[i].split("-")[0];
				point = parseInt(buyRecord[i].split("-")[1]);

				// 加總使用的點數
				usedPoint += point;

				// 找出兌換 item 的資料
				index = itemSet.indexOf(item);

				url = urlSet[index];
				title = titleSet[index];

				// 印出資料
				html += "<li><a href='" + url + "' target='_blank'>" + title + "</a> (<span class='red'>" + point + " 點</span>)</li>";
			}
			html += "</ol>";

			// 列出目前點數、使用點數
			html += "<div class='center'><span>總共兌換點數：<span class='red'>" + usedPoint + "</span> 點</span></div>";

			$(".member_announce_text").html(html);
		}

		$("#member_load").load(ms.u.consume + " #member_consume", function() {
			// 如果沒有兌換記錄
			if (!buyedItem) {
				$(".member_announce_text").html("<div class='center'><div>沒有兌換記錄</div><div>(\"一般會員\"不保留記錄)</div></div>");
				return;
			}

			// 有兌換記錄時, 取得加值文章 json
			$.ajax({
				type: "post",
				data: {
					"password": password,
					"method": "valuePostList",
					"query": ms.json.id
				},
				url: webAppUrl,
				success: function(json) {
					buyedPostList(json);
				}
			});
		});
	})(memberSys, jQuery);

};


if (typeof FB == 'undefined') {
	$.getScript('//connect.facebook.net/zh_TW/sdk.js', memberSys.checkLoginState);
} else {
	memberSys.checkLoginState();
}

/*FB.XFBML.parse();
memberSys.checkLoginState();*/