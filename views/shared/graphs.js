let graph = {
    line: function(canvas, data){
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;

        let context = canvas.getContext("2d");

        let left = canvas.clientWidth - (canvas.clientWidth * 0.75);
        let right = canvas.clientWidth * 0.75;
        let bottom = canvas.clientHeight * 0.9;
        let top = canvas.clientHeight - (canvas.clientHeight * 0.9);

        let max = data[0];
        for(let point of data){
            if(point > max){max = point;}
        }

        let verticalMultiplier = (bottom - top) / max;
        let horizontalMultiplier = (right - left) / data.length;

        //Draw axes
        context.beginPath();
        context.moveTo(left, top);
        context.lineTo(left, bottom);
        context.stroke();

        context.beginPath();
        context.moveTo(left, bottom);
        context.lineTo(right, bottom);
        context.stroke();

        context.beginPath();
        context.moveTo(right, bottom);
        context.lineTo(right, top);
        context.stroke();

        context.beginPath();
        context.moveTo(left, top);
        context.lineTo(right, top);
        context.stroke();

        for(let i = 0; i < data.length - 1; i++){
            context.beginPath();
            context.moveTo(left + (horizontalMultiplier * i), bottom - (verticalMultiplier * data[i]));
            context.lineTo(left + (horizontalMultiplier * (i + 1)), bottom - (verticalMultiplier * data[i + 1]));
            context.stroke();
        }
    }
}