class LineGraph{
    constructor(canvas, yName, xName, xData){
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;

        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.left = canvas.clientWidth - (canvas.clientWidth * 0.9);
        this.right = canvas.clientWidth * 0.9;
        this.top = canvas.clientHeight - (canvas.clientHeight * 0.9);
        this.bottom = canvas.clientHeight * 0.9;
        this.data = [];
        this.max = 0;
        this.xName = xName;
        this.yName = yName;
        this.xData = xData;
        this.colors = [];
        this.colorIndex = 0

        for(let i = 0; i < 100; i++){
            let redRand = Math.floor(Math.random() * 200);
            let greenRand = Math.floor(Math.random() * 200);
            let blueRand = Math.floor(Math.random() * 200);

            this.colors.push(`rgb(${redRand}, ${greenRand}, ${blueRand})`);
        }
    }

    addData(data){
        data.colorIndex = this.colorIndex;
        this.colorIndex++;
        this.data.push(data);

        let isNewMax = false;
        for(let point of data.set){
            if(point > this.max){
                this.max = point;
                isNewMax = true;
            }
        }

        if(isNewMax){
            this.verticalMultiplier = (this.bottom - this.top) / this.max;
            this.horizontalMultiplier = (this.right - this.left) / data.set.length;
            
            this.xData.dataLength = data.set.length;
            this.drawGraph();
        }else{
            this.drawData(data);
        }
    }

    removeData(id){
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].id === id){
                this.data.splice(i, 1);
                break;
            }
        }

        this.drawGraph();
    }

    clear(){
        this.max = 0;
        this.data = [];
    }

    drawGraph(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawYAxis();
        this.drawXAxis();

        for(let dataSet of this.data){
            this.drawData(dataSet);
        }
    }

    drawData(data){
        for(let i = 0; i < data.set.length - 1; i++){
            this.context.beginPath();
            this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom - (this.verticalMultiplier * data.set[i]));
            this.context.lineTo(this.left + (this.horizontalMultiplier * (i + 1)), this.bottom - (this.verticalMultiplier * data.set[i + 1]));
            this.context.strokeStyle = this.colors[data.colorIndex];
            this.context.stroke();
        }

        this.context.strokeStyle = "black";
    }

    drawXAxis(){
        this.context.beginPath();
        this.context.moveTo(this.left, this.bottom);
        this.context.lineTo(this.right, this.bottom);
        this.context.lineWidth = 2;
        this.context.stroke();

        this.context.font = "25px Arial";
        this.context.fillText(this.xName, this.right / 2, this.bottom + 50);

        this.context.setLineDash([5, 10]);
        this.context.font = "10px Arial";
        this.context.lineWidth = 1;

        if(this.xData.type = "date"){
            let diff = Math.abs(Math.floor((Date.UTC(this.xData.start.getFullYear(), this.xData.start.getMonth(), this.xData.start.getDate()) - Date.UTC(this.xData.end.getFullYear(), this.xData.end.getMonth(), this.xData.end.getDate())) / (1000 * 60 * 60 * 24)));
            let showDate = new Date(this.xData.start);
            
            for(let i = 0; i < this.xData.dataLength; i += Math.floor(this.xData.dataLength / 10)){
                this.context.fillText(showDate.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "2-digit"}), this.left + (this.horizontalMultiplier * i) - 20, this.bottom + 15);

                if(i !== 0){
                    this.context.beginPath()
                    this.context.moveTo(this.left + (this.horizontalMultiplier * i), this.bottom);
                    this.context.lineTo(this.left + (this.horizontalMultiplier * i), this.top);
                    this.context.strokeStyle = "#a5a5a5";
                    this.context.stroke();
                }

                showDate.setDate(showDate.getDate() + Math.abs(diff / 10));
            }
            
        }

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }

    drawYAxis(){
        this.context.beginPath();
        this.context.moveTo(this.left, this.top);
        this.context.lineTo(this.left, this.bottom);
        this.context.lineWidth = 2;
        this.context.stroke();

        this.context.font = "25px Arial";
        this.context.fillText(this.yName, 0, this.bottom / 2);

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
            axisNum += this.max / 10;
        }while(verticalOffset <= (this.bottom - this.top));

        this.context.strokeStyle = "black";
        this.context.setLineDash([]);
    }
}