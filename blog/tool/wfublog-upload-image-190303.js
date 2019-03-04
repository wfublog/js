(function($) {
	// 網路應用程式網址
	var appUrl = "https://script.google.com/macros/s/AKfycbwjJR68px9FEgi_GzueBklP11ZPJctgh84OPJE7rhKNh_8JlyGH/exec",
		file = document.getElementById("upload_img").files[0],
		fileReader;

	// 若是 safari，則警告無法使用
	if (file) {
		fileReader = new FileReader();
		fileReader.onload = getImgInfo;
		fileReader.readAsDataURL(file);
	} else {
		alert("您的瀏覽器無法上傳圖片，請改用主流瀏覽器，例如 Chrome、FireFox！");
	}

	function getImgInfo(evt) {
		var filename = file.name,
			fileType = file.type.split("/"),
			type = fileType[0],
			imgType = fileType[1],
			dataUrl = evt.target.result,
			base64Data = dataUrl.split(",")[1];

		// 如果不是圖片 則不執行
		if (type != "image") {
			alert("上傳的檔案不是圖片！");
			return;
		}

		// 這是預覽圖片的語法
		// $("#image").attr("src", dataUrl);

		uploadImage(filename, file.type, base64Data);
	}

	function uploadImage(filename, fileType, base64Data) {
		$.ajax({
			type: "post",
			data: {
				"method": "wfublog",
				"fileName": filename,
				"type": fileType,
				"base64Data": base64Data,
				"blogUrl": location.href
			},
			url: appUrl, // 填入網路應用程式網址
			success: function(imgUrl) { // 成功時回傳圖片網址
				var id = "select_img_url",
					range;
				$("#show_img_url").html("<a id='select_img_url' href='" + imgUrl + "' target='_blank'>" + imgUrl + "</a><div class='text-danger'>圖片網址已選取，請按 Ctrl-C 複製，再按 Ctrl-V 貼到留言框</div><div class='text-danger'>也可點擊圖片網址觀看圖片</div>");

				// 自動選取網址
				if (document.selection) {
					range = document.body.createTextRange();
					range.moveToElementText(document.getElementById(id));
					range.select();
				} else if (window.getSelection) {
					range = document.createRange();
					range.selectNode(document.getElementById(id));
					window.getSelection().addRange(range);
				}
			},
			error: function(e) {
				console.log(JSON.stringify(e));
				alert("伺服器目前不穩定，請稍後再試！");
			}
		});
	}
})(jQuery);
