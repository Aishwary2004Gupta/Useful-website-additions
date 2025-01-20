$(".change").on("click", function () {
    if ($("body").hasClass("dark")) {
        $("body").removeClass("dark");
        $(".change").html("&#9728;"); // Sun Icon
    } else {
        $("body").addClass("dark");
        $(".change").html("&#9790;"); // Moon Icon
    }
});
