class LineGraph{
    constructor(canvas, data, yName, xName, xData){
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;

        this.context = canvas.getContext("2d");
        this.left = canvas.clientWidth - (canvas.clientWidth * 0.9);
        this.right = canvas.clientWidth * 0.9;
        this.top = canvas.clientHeight - (canvas.clientHeight * 0.9);
        this.bottom = canvas.clientHeight * 0.9;

        let max = data[0];
        for(let point of data){
            if(point > max){max = point;}
        }

        this.verticalMultiplier = (this.bottom - this.top) / max;
        this.horizontalMultiplier = (this.right - this.left) / data.length;

        xData.dataLength = data.length;

        this.drawYAxis(yName, max);
        this.drawXAxis(xName, xData);
        this.addLine(data);
    }

    addLine(data){
        let redRand = Math.floor(Math.random() * 200);
        let greenRand = Math.floor(Math.random() * 200);
        let blueRand = Math.floor(Math.random() * 200);

        for(let i = 0; i < data.length - 1; i++){
            this.context.beginPath();
            this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom - (this.verticalMultiplier * data[i]));
            this.context.lineTo(this.left + (this.horizontalMultiplier * (i + 1)), this.bottom - (this.verticalMultiplier * data[i + 1]));
            this.context.lineWidth = 1;
            this.context.strokeStyle = `rgb(${redRand}, ${greenRand}, ${blueRand})`;
            this.context.stroke();
        }
    }

    drawXAxis(xName, xData){
        this.context.beginPath();
        this.context.moveTo(this.left, this.bottom);
        this.context.lineTo(this.right, this.bottom);
        this.context.lineWidth = 2;
        this.context.stroke();

        this.context.font = "25px Arial";
        this.context.fillText(xName, this.right / 2, this.bottom + 50);

        this.context.setLineDash([5, 10]);
        this.context.font = "10px Arial";
        this.context.lineWidth = 1;

        if(xData.type = "date"){
            let diff = Math.abs(Math.floor((Date.UTC(xData.start.getFullYear(), xData.start.getMonth(), xData.start.getDate()) - Date.UTC(xData.end.getFullYear(), xData.end.getMonth(), xData.end.getDate())) / (1000 * 60 * 60 * 24)));
            // let horizontalIncrement = (this.right - this.left) /10
            // let horizontalOffset = 0
            let showDate = xData.start;

            for(let i = 0; i < xData.dataLength; i += Math.floor(xData.dataLength / 10)){
                this.context.fillText(showDate.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "2-digit"}), this.left + (this.horizontalMultiplier * i) - 20, this.bottom + 15);

                this.context.beginPath()
                this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom);
                this.context.lineTo(this.left + (this.horizontalMultiplier * i), this.top);
                this.context.strokeStyle = "#a5a5a5";
                this.context.stroke();

                showDate.setDate(showDate.getDate() + Math.abs(diff / 10));
            }

            // do{
            //     this.context.fillText(showDate.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "2-digit"}), this.left + horizontalOffset - 20, this.bottom + 10);

            //     this.context.beginPath();
            //     this.context.moveTo(this.left + horizontalOffset, this.bottom);
            //     this.context.lineTo(this.left + horizontalOffset, this.top);
            //     this.context.strokeStyle = "#a5a5a5";
            //     this.context.stroke();

            //     showDate.setDate(showDate.getDate() + (Math.abs(diff / 10)));
            //     horizontalOffset += horizontalIncrement;
            // }while(horizontalOffset < (this.right - this.left));
        }

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }

    drawYAxis(yName, max){
        this.context.beginPath();
        this.context.moveTo(this.left, this.top);
        this.context.lineTo(this.left, this.bottom);
        this.context.lineWidth = 2;
        this.context.stroke();

        this.context.font = "25px Arial";
        this.context.fillText(yName, 0, this.bottom / 2);

        this.context.setLineDash([5, 10]);
        this.context.font = "10px Arial";
        this.context.lineWidth = 1;

        let axisNum = 0;
        let verticalIncrement = (this.bottom - this.top) / 10;
        let verticalOffset = 0;
        do{
            this.context.fillText(Math.round(axisNum).toString(), this.left - 20, this.bottom - verticalOffset + 3);

            this.context.beginPath();
            this.context.moveTo(this.left, this.bottom - verticalOffset);
            this.context.lineTo(this.right, this.bottom - verticalOffset);
            this.context.strokeStyle = "#a5a5a5";
            this.context.stroke();

            verticalOffset += verticalIncrement;
            axisNum += max / 10;
        }while(verticalOffset <= (this.bottom - this.top));

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }
}