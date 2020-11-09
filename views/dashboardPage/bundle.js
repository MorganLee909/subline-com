<<<<<<< HEAD
!function(){var e={isPopulated:!1,display:function(){this.isPopulated||(this.drawRevenueCard(),this.drawRevenueGraph(),this.drawInventoryCheckCard(),this.drawPopularCard(),this.isPopulated=!0)},drawRevenueCard:function(){let e=new Date,t=new Date(e.getFullYear(),e.getMonth(),1),n=new Date(e.getFullYear(),e.getMonth()-1,1),i=new Date((new Date).setMonth(e.getMonth()-1));const r=merchant.getRevenue(t),s=merchant.getRevenue(n,i);document.getElementById("revenue").innerText="$"+r.toFixed(2);let a=(r-s)/s*100,d="";d=a>=0?"/shared/images/upArrow.png":"/shared/images/downArrow.png",document.querySelector("#revenueChange p").innerText=Math.abs(a).toFixed(2)+"% vs last month",document.querySelector("#revenueChange img").src=d},drawRevenueGraph:function(){let e=new Date;e.setMonth(e.getMonth()-1);let t=[],n=[],i=0;const r=merchant.getTransactions(e);let s=r.length>0?r[0].date:void 0;for(let d=0;d<r.length;d++){r[d].date.getDate()!==s.getDate()&&(t.push(i/100),i=0,n.push(s),s=r[d].date);for(let e=0;e<r[d].recipes.length;e++){const t=r[d].recipes[e];i+=t.recipe.price*t.quantity}}const a={x:n,y:t,mode:"lines+markers",line:{color:"rgb(255, 99, 107)"}};Plotly.newPlot("graphCard",[a],{title:"REVENUE",xaxis:{title:"DATE"},yaxis:{title:"$"}})},drawInventoryCheckCard:function(){let e;e=merchant.ingredients.length<5?merchant.ingredients.length:5;let t=[];for(let r=0;r<e;r++){let e=Math.floor(Math.random()*merchant.ingredients.length);t.includes(e)?r--:t[r]=e}let n=document.querySelector("#inventoryCheckCard ul"),i=document.getElementById("ingredientCheck").content.children[0];for(;n.children.length>0;)n.removeChild(n.firstChild);for(let r=0;r<t.length;r++){let e=i.cloneNode(!0),s=e.children[1].children[1];const a=merchant.ingredients[t[r]];e.ingredient=a,e.children[0].innerText=a.ingredient.name,e.children[1].children[0].onclick=()=>{s.value--,s.changed=!0},"bottle"===a.ingredient.specialUnit?(s.value=a.quantity.toFixed(2),e.children[2].innerText="BOTTLES"):(s.value=a.quantity.toFixed(2),e.children[2].innerText=a.ingredient.unit.toUpperCase()),e.children[1].children[2].onclick=()=>{s.value++,s.changed=!0},s.onchange=()=>{s.changed=!0},n.appendChild(e)}document.getElementById("inventoryCheck").onclick=()=>{this.submitInventoryCheck()}},drawPopularCard:function(){let e=new Date;e.setDate(1);const t=merchant.getIngredientsSold(e);if(!1!==t){t.sort((e,t)=>e.quantity<t.quantity?1:e.quantity>t.quantity?-1:0);let e=[],n=[],i=[];for(let a=t.length<5?t.length-1:4;a>=0;a--){const r=t[a].ingredient.name,s=t[a].quantity,d=t[a].ingredient.unit;e.push(t[a].quantity),n.push(`${r}: ${s.toFixed(2)} ${d.toUpperCase()}`),0===a?i.push("rgb(255, 99, 107"):i.push("rgb(179, 191, 209")}let r={x:e,type:"bar",orientation:"h",text:n,textposition:"auto",hoverinfo:"none",marker:{color:i}},s={title:"MOST POPULAR INGREDIENTS",xaxis:{zeroline:!1,title:"QUANTITY"},yaxis:{showticklabels:!1}};Plotly.newPlot("popularIngredientsCard",[r],s)}else{document.getElementById("popularCanvas").style.display="none";let e=document.createElement("p");e.innerText="N/A",e.classList="notice",document.getElementById("popularIngredientsCard").appendChild(e)}},submitInventoryCheck:function(){let e=document.querySelectorAll("#inventoryCheckCard li"),t=[],n=[];for(let i=0;i<e.length;i++){if(!(e[i].children[1].children[1].value>=0))return void banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");{let r=e[i].ingredient;if(!0===e[i].children[1].children[1].changed){let s=0;s="bottle"===r.ingredient.specialUnit?parseFloat(e[i].children[1].children[1].value)*r.ingredient.unitSize:controller.convertToMain(r.ingredient.unit,parseFloat(e[i].children[1].children[1].value)),t.push({ingredient:r.ingredient,quantity:s}),n.push({id:r.ingredient.id,quantity:s}),e[i].children[1].children[1].changed=!1}}}if(n.length>0){let e=document.getElementById("loaderContainer");e.style.display="flex",fetch("/merchant/ingredients/update",{method:"PUT",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(n)}).then(e=>e.json()).then(e=>{if("string"==typeof e)banner.createError(e);else{for(let e=0;e<t.length;e++)merchant.updateIngredient(t[e].ingredient,t[e].quantity);banner.createNotification("INGREDIENTS UPDATED")}}).catch(e=>{}).finally(()=>{e.style.display="none"})}}};var t={isPopulated:!1,ingredients:[],display:function(){this.isPopulated||(document.getElementById("ingredientSearch").oninput=()=>{this.search()},this.populateByProperty(),this.isPopulated=!0)},populateByProperty:function(){let e;e=merchant.categorizeIngredients();let t=document.getElementById("categoryList"),n=document.getElementById("categoryDiv").content.children[0],i=document.getElementById("ingredient").content.children[0];for(this.ingredients=[];t.children.length>0;)t.removeChild(t.firstChild);for(let r=0;r<e.length;r++){let s=n.cloneNode(!0);s.children[0].children[0].innerText=e[r].name.toUpperCase(),s.children[0].onclick=()=>{this.toggleCategory(s.children[1],s.children[0].children[1])},s.children[1].style.display="none",t.appendChild(s);for(let t=0;t<e[r].ingredients.length;t++){let n=e[r].ingredients[t],a=i.cloneNode(!0);a.children[0].innerText=n.ingredient.name,a.onclick=()=>{controller.openSidebar("ingredientDetails",n),a.classList.add("active")},a._name=n.ingredient.name.toLowerCase(),a._unit=n.ingredient.unit.toLowerCase(),"bottle"===n.ingredient.specialUnit?a.children[2].innerText=n.quantity.toFixed(2)+" BOTTLES":a.children[2].innerText=`${n.quantity.toFixed(2)} ${n.ingredient.unit.toUpperCase()}`,s.children[1].appendChild(a),this.ingredients.push(a)}}},displayIngredientsOnly:function(e){let t=document.getElementById("categoryList");for(;t.children.length>0;)t.removeChild(t.firstChild);for(let n=0;n<e.length;n++)t.appendChild(e[n])},toggleCategory:function(e,t){"none"===e.style.display?(t.innerHTML='<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>',e.style.display="flex"):"flex"===e.style.display&&(t.innerHTML='<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',e.style.display="none")},search:function(){let e=document.getElementById("ingredientSearch").value.toLowerCase();if(""===e)return void this.populateByProperty();let t=[];for(let n=0;n<this.ingredients.length;n++)this.ingredients[n]._name.includes(e)&&t.push(this.ingredients[n]);this.displayIngredientsOnly(t)}};var n={isPopulated:!1,recipeDivList:[],display:function(e){this.isPopulated||(this.populateRecipes(),"none"!==merchant.pos&&(document.getElementById("posUpdateRecipe").onclick=()=>{this.posUpdate(e)}),document.getElementById("recipeSearch").oninput=()=>{this.search()},this.populateRecipes(),this.isPopulated=!0)},populateRecipes:function(){let e=document.getElementById("recipeList"),t=document.getElementById("recipe").content.children[0];for(this.recipeDivList=[];e.children.length>0;)e.removeChild(e.firstChild);for(let n=0;n<merchant.recipes.length;n++){let i=t.cloneNode(!0);i.onclick=()=>{controller.openSidebar("recipeDetails",merchant.recipes[n]),i.classList.add("active")},i._name=merchant.recipes[n].name,e.appendChild(i),i.children[0].innerText=merchant.recipes[n].name,i.children[1].innerText="$"+merchant.recipes[n].price.toFixed(2),this.recipeDivList.push(i)}},search:function(){let e=document.getElementById("recipeSearch").value.toLowerCase(),t=document.getElementById("recipeList"),n=[];for(let i=0;i<this.recipeDivList.length;i++)this.recipeDivList[i]._name.toLowerCase().includes(e)&&n.push(this.recipeDivList[i]);for(;t.children.length>0;)t.removeChild(t.firstChild);for(let i=0;i<n.length;i++)t.appendChild(n[i])},posUpdate:function(e){let t=document.getElementById("loaderContainer");t.style.display="flex";let n="/recipe/update/"+merchant.pos;fetch(n,{method:"GET",headers:{"Content-Type":"application/json;charset=utf-8"}}).then(e=>e.json()).then(t=>{if("string"==typeof t)banner.createError(t);else{for(let n=0;n<t.new.length;n++){const i=new e(t.new[n]._id,t.new[n].name,t.new[n].price,merchant,[]);merchant.addRecipe(i)}for(let e=0;e<t.removed.length;e++)for(let n=0;n<merchant.recipes.length;n++)if(merchant.recipes[n].id===t.removed[e]._id){merchant.removeRecipe(merchant.recipes[n]);break}this.display()}}).catch(e=>{banner.createError("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE")}).finally(()=>{t.style.display="none"})}};var i={newData:!1,dateChange:!1,transactions:[],ingredient:{},recipe:{},display:function(e){if(document.getElementById("analDateBtn").onclick=()=>{this.changeDates(e)},0===this.transactions.length||!0===this.newData){let e=new Date;e.setMonth(e.getMonth()-1),this.transactions=merchant.getTransactions(e)}let t=document.getElementById("analSlider");t.onchange=()=>{this.display(e)};let n=document.getElementById("analIngredientContent"),i=document.getElementById("analRecipeContent");t.checked?(n.style.display="none",i.style.display="flex",this.displayRecipes()):(n.style.display="flex",i.style.display="none",this.displayIngredients())},displayIngredients:function(){const e=document.getElementById("itemsList");for(;e.children.length>0;)e.removeChild(e.firstChild);for(let t=0;t<merchant.ingredients.length;t++){let n=document.createElement("li");n.classList.add("choosable"),n.item=merchant.ingredients[t],n.innerText=merchant.ingredients[t].ingredient.name,n.onclick=()=>{const e=document.getElementById("itemsList");for(let t=0;t<e.children.length;t++)e.children[t].classList.remove("active");n.classList.add("active"),this.ingredient=merchant.ingredients[t],this.ingredientDisplay()},e.appendChild(n)}this.dateChange&&0!==Object.keys(this.ingredient).length&&this.ingredientDisplay(),this.dateChange=!1},displayRecipes:function(){let e=document.getElementById("analRecipeList");for(;e.children.length>0;)e.removeChild(e.firstChild);for(let t=0;t<merchant.recipes.length;t++){let n=document.createElement("li");n.classList.add("choosable"),n.recipe=merchant.recipes[t],n.innerText=merchant.recipes[t].name,n.onclick=()=>{let e=document.getElementById("analRecipeList");for(let t=0;t<e.children.length;t++)e.children[t].classList.remove("active");n.classList.add("active"),this.recipe=merchant.recipes[t],this.recipeDisplay()},e.appendChild(n)}this.dateChange&&0!==Object.keys(this.recipe).length&&this.recipeDisplay(),this.dateChange=!1},ingredientDisplay:function(){let e=[];for(let u=0;u<merchant.recipes.length;u++)for(let t=0;t<merchant.recipes[u].ingredients.length;t++)if(merchant.recipes[u].ingredients[t].ingredient===this.ingredient.ingredient){e.push({recipe:merchant.recipes[u],quantity:merchant.recipes[u].ingredients[t].quantity});break}let t=[],n=[],i=this.transactions.length>0?this.transactions[0].date:void 0,r=0;for(let u=0;u<this.transactions.length;u++){i.getDate()!==this.transactions[u].date.getDate()&&(t.push(r),n.push(i),r=0,i=this.transactions[u].date);for(let t=0;t<this.transactions[u].recipes.length;t++)for(let n=0;n<e.length;n++)if(this.transactions[u].recipes[t].recipe===e[n].recipe)for(let e=0;e<this.transactions[u].recipes[t].recipe.ingredients.length;e++){const n=this.transactions[u].recipes[t].recipe.ingredients[e];if(n.ingredient===this.ingredient.ingredient){r+=n.quantity*this.transactions[u].recipes[t].quantity;break}}u===this.transactions.length-1&&(t.push(r),n.push(i))}let s={x:n,y:t,mode:"lines+markers",line:{color:"rgb(255, 99, 107)"}};const a={title:this.ingredient.ingredient.name.toUpperCase(),xaxis:{title:"DATE"},yaxis:{title:`QUANTITY (${this.ingredient.ingredient.unit.toUpperCase()})`}};Plotly.newPlot("itemUseGraph",[s],a);let d=0,l=0,c=t.length>0?t[0]:0;for(let u=0;u<t.length;u++)d+=t[u],t[u]>l?l=t[u]:t[u]<c&&(c=t[u]);document.getElementById("analMinUse").innerText=`${c.toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analAvgUse").innerText=`${(d/t.length).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analMaxUse").innerText=`${l.toFixed(2)} ${this.ingredient.ingredient.unit}`;let o=[0,0,0,0,0,0,0],h=[0,0,0,0,0,0,0];for(let u=0;u<t.length;u++)o[n[u].getDay()]+=t[u],h[n[u].getDay()]++;document.getElementById("analDayOne").innerText=`${(o[0]/h[0]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDayTwo").innerText=`${(o[1]/h[1]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDayThree").innerText=`${(o[2]/h[2]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDayFour").innerText=`${(o[3]/h[3]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDayFive").innerText=`${(o[4]/h[4]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDaySix").innerText=`${(o[5]/h[5]).toFixed(2)} ${this.ingredient.ingredient.unit}`,document.getElementById("analDaySeven").innerText=`${(o[6]/h[6]).toFixed(2)} ${this.ingredient.ingredient.unit}`},recipeDisplay:function(){let e,t=[],n=[],i=0;this.transactions.length>0&&(e=this.transactions[0].date);for(let d=0;d<this.transactions.length;d++){e.getDate()!==this.transactions[d].date.getDate()&&(t.push(i),i=0,n.push(e),e=this.transactions[d].date);for(let e=0;e<this.transactions[d].recipes.length;e++){const t=this.transactions[d].recipes[e];t.recipe===this.recipe&&(i+=t.quantity)}d===this.transactions.length-1&&(t.push(i),n.push(e))}const r={x:n,y:t,mode:"lines+markers",line:{color:"rgb(255, 99, 107"}},s={title:this.recipe.name.toUpperCase(),xaxis:{title:"DATE"},yaxis:{title:"Quantity"}};Plotly.newPlot("recipeSalesGraph",[r],s);let a=0;for(let d=0;d<t.length;d++)a+=t[d];document.getElementById("recipeAvgUse").innerText=(a/t.length).toFixed(2),document.getElementById("recipeAvgRevenue").innerText="$"+(a/t.length*this.recipe.price/100).toFixed(2)},changeDates:function(e){let t={from:document.getElementById("analStartDate").valueAsDate,to:document.getElementById("analEndDate").valueAsDate};if(t.from>t.to||""===t.from||""===t.to||t.to>new Date)return void banner.createError("INVALID DATE");let n=document.getElementById("loaderContainer");n.style.display="flex",fetch("/transaction/retrieve",{method:"post",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(t)}).then(e=>e.json()).then(t=>{if("string"==typeof t)banner.createError(t.data);else{this.transactions=[];for(let i=0;i<t.length;i++)this.transactions.push(new e(t[i]._id,new Date(t[i].date),t[i].recipes,merchant));let n=document.getElementById("analSlider").checked;n&&0!==Object.keys(this.recipe).length?this.recipeDisplay():n||0===Object.keys(this.ingredient).length||this.ingredientDisplay(),this.dateChange=!0}}).catch(e=>{banner.createError("ERROR: UNABLE TO DISPLAY THE DATA")}).finally(()=>{n.style.display="none"})}};var r={orders:[],display:function(){document.getElementById("orderFilterBtn").onclick=()=>{controller.openSidebar("orderFilter")},document.getElementById("newOrderBtn").onclick=()=>{controller.openSidebar("newOrder")};let e=document.getElementById("orderList"),t=document.getElementById("order").content.children[0];for(;e.children.length>0;)e.removeChild(e.firstChild);for(let n=0;n<this.orders.length;n++){let i=t.cloneNode(!0);i.order=this.orders[n],i.children[0].innerText=this.orders[n].name,i.children[1].innerText=this.orders[n].ingredients.length+" ingredients",i.children[2].innerText=this.orders[n].date.toLocaleDateString("en-US"),i.children[3].innerText="$"+this.orders[n].getTotalCost().toFixed(2),i.onclick=()=>{controller.openSidebar("orderDetails",this.orders[n]),i.classList.add("active")},e.appendChild(i)}},getOrders:function(e){let t=document.getElementById("loaderContainer");return t.style.display="flex",fetch("/order",{method:"get",headers:{"Content-Type":"application/json;charset=utf-8"}}).then(e=>e.json()).then(t=>{if("string"!=typeof t){let n=[];for(let i=0;i<t.length;i++)n.push(new e(t[i]._id,t[i].name,t[i].date,t[i].taxes,t[i].fees,t[i].ingredients,merchant));return 0===merchant.orders.length&&merchant.setOrders(n),n}banner.createError(t)}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{t.style.display="none"})}};var s={transactions:[],display:function(e){document.getElementById("filterTransactionsButton").onclick=()=>{controller.openSidebar("transactionFilter")},document.getElementById("newTransactionButton").onclick=()=>{controller.openSidebar("newTransaction")},this.populateTransactions(this.transactions),this.isPopulated=!0},populateTransactions:function(e){let t=document.getElementById("transactionsList"),n=document.getElementById("transaction").content.children[0];for(;t.children.length>0;)t.removeChild(t.firstChild);let i=0;for(;i<e.length&&i<100;){let r=n.cloneNode(!0),s=e[i];r.onclick=()=>{controller.openSidebar("transactionDetails",s),r.classList.add("active")},t.appendChild(r);let a=0,d=0;for(let t=0;t<e[i].recipes.length;t++)a+=e[i].recipes[t].quantity,d+=e[i].recipes[t].recipe.price*e[i].recipes[t].quantity;r.children[0].innerText=`${e[i].date.toLocaleDateString()} ${e[i].date.toLocaleTimeString()}`,r.children[1].innerText=a+" recipes sold",r.children[2].innerText="$"+d.toFixed(2),i++}}};var a={dailyUse:0,display:function(e){document.getElementById("editIngBtn").onclick=()=>{controller.openSidebar("editIngredient",e)},document.getElementById("removeIngBtn").onclick=()=>{this.remove(e)},document.getElementById("ingredientDetailsCategory").innerText=e.ingredient.category,document.getElementById("ingredientDetailsName").innerText=e.ingredient.name,document.getElementById("ingredientStock").innerText=e.getQuantityDisplay();let t=[],n=new Date;for(let c=1;c<31;c++){let i=new Date(n.getFullYear(),n.getMonth(),n.getDate()-c),r=new Date(n.getFullYear(),n.getMonth(),n.getDate()-c-1);t.push(merchant.getSingleIngredientSold(e,r,i))}let i=0;for(let c=0;c<t.length;c++)i+=t[c];let r=i/t.length;const s=document.getElementById("dailyUse");"bottle"===e.ingredient.specialUnit?s.innerText=r.toFixed(2)+" BOTTLES":s.innerText=`${r.toFixed(2)} ${e.ingredient.unit.toUpperCase()}`;let a=document.getElementById("ingredientRecipeList"),d=document.getElementById("ingredientRecipe").content.children[0],l=merchant.getRecipesForIngredient(e.ingredient);for(;a.children.length>0;)a.removeChild(a.firstChild);for(let c=0;c<l.length;c++){let e=d.cloneNode(!0);e.children[0].innerText=l[c].name,e.onclick=()=>{controller.openStrand("recipeBook"),controller.openSidebar("recipeDetails",l[c])},e.classList.add("choosable"),a.appendChild(e)}},remove:function(e){for(let n=0;n<merchant.recipes.length;n++)for(let t=0;t<merchant.recipes[n].ingredients.length;t++)if(e.ingredient===merchant.recipes[n].ingredients[t].ingredient)return void banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");let t=document.getElementById("loaderContainer");t.style.display="flex",fetch("/ingredients/remove/"+e.ingredient.id,{method:"delete"}).then(e=>e.json()).then(t=>{"string"==typeof t?banner.createError(t):(merchant.removeIngredient(e),controller.openStrand("ingredients"),banner.createNotification("INGREDIENT REMOVED"))}).catch(e=>{}).finally(()=>{t.style.display="none"})}};var d={display:function(e){const t=document.getElementById("unitSelector");document.getElementById("newIngName").value="",document.getElementById("newIngCategory").value="",document.getElementById("newIngQuantity").value=0,document.getElementById("bottleSizeLabel").style.display="none",t.value="g",t.onchange=()=>{this.unitChange()},document.getElementById("submitNewIng").onclick=()=>{this.submit(e)}},unitChange:function(){const e=document.getElementById("unitSelector"),t=document.getElementById("bottleSizeLabel");"bottle"===e.value?t.style.display="block":t.style.display="none"},submit:function(e){let n=document.getElementById("unitSelector"),i=document.querySelectorAll("#unitSelector option");const r=parseFloat(document.getElementById("newIngQuantity").value);let s=n.value,a={ingredient:{name:document.getElementById("newIngName").value,category:document.getElementById("newIngCategory").value,unitType:i[n.selectedIndex].getAttribute("type")},quantity:r,defaultUnit:s};"bottle"===s&&(a.ingredient.unitType="volume",a.ingredient.unitSize=document.getElementById("bottleSize").value,a.defaultUnit=document.getElementById("bottleUnits").value,a.ingredient.specialUnit=s,a.quantity=r);let d=document.getElementById("loaderContainer");d.style.display="flex",fetch("/ingredients/create",{method:"POST",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(a)}).then(e=>e.json()).then(n=>{if("string"==typeof n)banner.createError(n);else{const i=new e(n.ingredient._id,n.ingredient.name,n.ingredient.category,n.ingredient.unitType,n.defaultUnit,merchant,n.ingredient.specialUnit,n.ingredient.unitSize);merchant.addIngredient(i,n.quantity),t.display(),controller.closeSidebar(),banner.createNotification("INGREDIENT CREATED")}}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{d.style.display="none"})}},l=class{constructor(e,t,n,i,r,s,a,d){return this.isSanitaryString(t)?this.isSanitaryString(n)?(this._id=e,this._name=t,this._category=n,this._unitType=i,this._unit=r,this._parent=s,void(a&&(this._specialUnit=a,this._unitSize=d))):(banner.createError("CATEGORY CONTAINS ILLEGAL CHARACTERS"),!1):(banner.createError("NAME CONTAINS ILLEGAL CHARCTERS"),!1)}get id(){return this._id}get name(){return this._name}set name(e){if(!this.isSanitaryString(e))return!1;this._name=e}get category(){return this._category}set category(e){if(!this.isSanitaryString(e))return!1;this._category=e}get unitType(){return this._unitType}get unit(){return this._unit}set unit(e){this._unit=e}get parent(){return this._parent}get specialUnit(){return this._specialUnit}get unitSize(){switch(this._unit){case"g":return this._unitSize;case"kg":return this._unitSize/1e3;case"oz":return this._unitSize/28.3495;case"lb":return this._unitSize/453.5924;case"ml":return 1e3*this._unitSize;case"l":return this._unitSize;case"tsp":return 202.8842*this._unitSize;case"tbsp":return 67.6278*this._unitSize;case"ozfl":return 33.8141*this._unitSize;case"cup":return 4.1667*this._unitSize;case"pt":return 2.1134*this._unitSize;case"qt":return 1.0567*this._unitSize;case"gal":return this._unitSize/3.7854;case"mm":return 1e3*this._unitSize;case"cm":return 100*this._unitSize;case"m":return this._unitSize;case"in":return 39.3701*this._unitSize;case"ft":return 3.2808*this._unitSize;default:return this._unitSize}}set unitSize(e){if(e<0)return!1;this._unitSize=e}getNameAndUnit(){return"bottle"===this._specialUnit?this._name+" (BOTTLES)":`${this._name} (${this._unit.toUpperCase()})`}isSanitaryString(e){let t=["\\","<",">","$","{","}","(",")"];for(let n=0;n<t.length;n++)if(e.includes(t[n]))return!1;return!0}};var c={display:function(e){let t=document.getElementById("unitButtons"),n=document.getElementById("editIngQuantityLabel"),i=document.getElementById("editSpecialLabel");for(;t.children.length>0;)t.removeChild(t.firstChild);document.getElementById("editIngTitle").innerText=e.ingredient.name,document.getElementById("editIngName").value=e.ingredient.name,document.getElementById("editIngCategory").value=e.ingredient.category,n.innerText=`CURRENT STOCK (${e.ingredient.unit.toUpperCase()})`,document.getElementById("editIngSubmit").onclick=()=>{this.submit(e)};const r=merchant.units[e.ingredient.unitType];for(let a=0;a<r.length;a++){let n=document.createElement("button");n.classList.add("unitButton"),n.innerText=r[a].toUpperCase(),n.onclick=()=>{this.changeUnit(n)},t.appendChild(n),r[a]===e.ingredient.unit&&n.classList.add("unitActive")}if("bottle"===e.ingredient.specialUnit){n.innerText="CURRENT STOCK (BOTTLES):",i.style.display="flex",i.innerText=`BOTTLE SIZE (${e.ingredient.unit.toUpperCase()}):`;let t=document.createElement("input");t.id="editIngSpecialSize",t.type="number",t.min="0",t.step="0.01",t.value=e.ingredient.unitSize.toFixed(2),i.appendChild(t)}else i.style.display="none";let s=document.createElement("input");s.id="editIngQuantity",s.type="number",s.min="0",s.step="0.01",s.value=e.quantity.toFixed(2),n.appendChild(s)},changeUnit(e){let t=document.getElementById("unitButtons");for(let n=0;n<t.children.length;n++)t.children[n].classList.remove("unitActive");e.classList.add("unitActive")},submit(e){const t=parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);let n={id:e.ingredient.id,name:document.getElementById("editIngName").value,category:document.getElementById("editIngCategory").value};if("bottle"===e.ingredient.specialUnit){let i=e.convertToBase(parseFloat(document.getElementById("editSpecialLabel").children[0].value));n.quantity=t*i,n.unitSize=i}else n.quantity=e.convertToBase(t);let i=document.getElementById("unitButtons");for(let s=0;s<i.children.length;s++)if(i.children[s].classList.contains("unitActive")){n.unit=i.children[s].innerText.toLowerCase();break}let r=document.getElementById("loaderContainer");r.style.display="flex",fetch("/ingredients/update",{method:"put",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(n)}).then(e=>e.json()).then(t=>{"string"==typeof t?banner.createError(t):(e.ingredient.name=t.ingredient.name,e.ingredient.category=t.ingredient.category,e.ingredient.unitSize=t.ingredient.unitSize,e.ingredient.unit=t.unit,merchant.updateIngredient(e,t.quantity),controller.openStrand("ingredients"),banner.createNotification("INGREDIENT UPDATED"))}).catch(e=>{banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE")}).finally(()=>{r.style.display="none"})}};var o={display:function(e){document.getElementById("sidebarDiv").classList.add("sidebarWide"),document.getElementById("newOrderIngredientList").style.display="flex";let t=document.getElementById("selectedIngredientList");for(;t.children.length>0;)t.removeChild(t.firstChild);let n=document.getElementById("newOrderIngredients");for(;n.children.length>0;)n.removeChild(n.firstChild);for(let i=0;i<merchant.ingredients.length;i++){let e=document.createElement("button");e.classList="choosable",e.innerText=merchant.ingredients[i].ingredient.name,e.onclick=()=>{this.addIngredient(merchant.ingredients[i],e)},n.appendChild(e)}document.getElementById("submitNewOrder").onclick=()=>{this.submit(e)}},addIngredient:function(e,t){t.style.display="none";let n=document.getElementById("selectedIngredient").content.children[0].cloneNode(!0);n.ingredient=e,n.children[0].children[1].onclick=()=>{this.removeIngredient(n,t)},"bottle"===e.ingredient.specialUnit?n.children[0].children[0].innerText=e.ingredient.name+" (BOTTLES)":n.children[0].children[0].innerText=`${e.ingredient.name} (${e.ingredient.unit.toUpperCase()})`,document.getElementById("selectedIngredientList").appendChild(n)},removeIngredient:function(e,t){e.parentElement.removeChild(e),t.style.display="block"},submit:function(e){let t=document.getElementById("newOrderDate").value,n=100*document.getElementById("orderTaxes").value,i=100*document.getElementById("orderFees").value,r=document.getElementById("selectedIngredientList").children;if(""===t)return void banner.createError("DATE IS REQUIRED FOR ORDERS");let s={name:document.getElementById("newOrderName").value,date:t,taxes:n,fees:i,ingredients:[]};for(let d=0;d<r.length;d++){let e=r[d].children[1].children[0].value,t=r[d].children[1].children[1].value;if(""===e||""===t)return void banner.createError("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS");(e<0||t<0)&&banner.createError("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS"),"bottle"===r[d].ingredient.ingredient.specialUnit?s.ingredients.push({ingredient:r[d].ingredient.ingredient.id,quantity:e*r[d].ingredient.ingredient.unitSize,pricePerUnit:this.convertPrice(r[d].ingredient.ingredient,100*t)}):s.ingredients.push({ingredient:r[d].ingredient.ingredient.id,quantity:r[d].ingredient.convertToBase(e),pricePerUnit:this.convertPrice(r[d].ingredient.ingredient,100*t)})}let a=document.getElementById("loaderContainer");a.style.display="flex",fetch("/order/create",{method:"post",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(s)}).then(e=>e.json()).then(t=>{if("string"==typeof t)banner.createError(t);else{let n=new e(t._id,t.name,t.date,t.taxes,t.fees,t.ingredients,merchant);merchant.addOrder(n,!0),controller.openStrand("orders",merchant.orders),banner.createNotification("NEW ORDER CREATED")}}).catch(e=>{banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE")}).finally(()=>{a.style.display="none"})},convertPrice:function(e,t){if("bottle"===e.specialUnit)return t/e.unitSize;switch(e.unit){case"g":return t;case"kg":return t/1e3;case"oz":return t/28.3495;case"lb":return t/453.5924;case"ml":return 1e3*t;case"l":return t;case"tsp":return 202.8842*t;case"tbsp":return 67.6278*t;case"ozfl":return 33.8141*t;case"cup":return 4.1667*t;case"pt":return 2.1134*t;case"qt":return 1.0567*t;case"gal":return t/3.7854;case"mm":return 1e3*t;case"cm":return 100*t;case"m":return t;case"in":return 39.3701*t;case"ft":return 3.2808*t}}};var h={display:function(e){document.getElementById("newRecipeName").value="",document.getElementById("newRecipePrice").value="",document.getElementById("ingredientCount").value=1;let t=merchant.categorizeIngredients(),n=document.getElementById("recipeInputIngredients");for(;n.children.length>0;)n.removeChild(n.firstChild);this.changeIngredientCount(t),document.getElementById("ingredientCount").onchange=()=>{this.changeIngredientCount(t)},document.getElementById("submitNewRecipe").onclick=()=>{this.submit(e)}},changeIngredientCount:function(e){let t=document.getElementById("ingredientCount").value,n=document.getElementById("recipeInputIngredients"),i=document.getElementById("recipeInputIngredient").content.children[0],r=n.children.length;if(t>r){let s=t-r;for(let t=0;t<s;t++){let s=i.cloneNode(!0);s.children[0].innnerText="INGREDIENT "+(t+r),s.children[2].children[0].value=0;for(let t=0;t<e.length;t++){let n=document.createElement("optgroup");n.label=e[t].name;for(let i=0;i<e[t].ingredients.length;i++){let r=document.createElement("option");r.innerText=e[t].ingredients[i].ingredient.getNameAndUnit(),r.ingredient=e[t].ingredients[i],n.appendChild(r)}s.children[1].children[0].appendChild(n)}n.appendChild(s)}for(let e=0;e<t;e++)n.children[e].children[0].innerText="INGREDIENT "+(e+1)}else if(t<r){let e=r-t;for(let t=0;t<e;t++)n.removeChild(n.children[n.children.length-1])}},submit:function(e){let t={name:document.getElementById("newRecipeName").value,price:document.getElementById("newRecipePrice").value,ingredients:[]},n=document.getElementById("recipeInputIngredients").children;for(let r=0;r<n.length;r++){let e=n[r].children[1].children[0],i=e.options[e.selectedIndex].ingredient;t.ingredients.push({ingredient:i.ingredient.id,quantity:i.convertToBase(n[r].children[2].children[0].value)})}let i=document.getElementById("loaderContainer");i.style.display="flex",fetch("/recipe/create",{method:"POST",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(t)}).then(e=>e.json()).then(t=>{if("string"==typeof t)banner.createError(t);else{let n=[];for(let e=0;e<t.ingredients.length;e++)for(let i=0;i<merchant.ingredients.length;i++)if(merchant.ingredients[i].ingredient.id===t.ingredients[e].ingredient){n.push({ingredient:merchant.ingredients[i].ingredient,quantity:t.ingredients[e].quantity});break}merchant.addRecipe(new e(t._id,t.name,t.price,n,merchant)),banner.createNotification("RECIPE CREATED"),controller.openStrand("recipeBook")}}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{i.style.display="none"})}};var u={display:function(e){let t=document.getElementById("editRecipeName");"none"===merchant.pos?t.value=e.name:(document.getElementById("editRecipeNoName").innertext=e.name,t.parentNode.style.display="none");let n=document.getElementById("editRecipeIngList");for(;n.children.length>0;)n.removeChild(n.firstChild);let i=document.getElementById("editRecipeIng").content.children[0];for(let r=0;r<e.ingredients.length;r++){let t=i.cloneNode(!0);t.children[0].onclick=()=>{t.parentNode.removeChild(t)},t.children[1].innerText=e.ingredients[r].ingredient.getNameAndUnit(),t.children[2].style.display="none",t.children[3].value=e.ingredients[r].quantity,t.ingredient=e.ingredients[r],n.appendChild(t)}document.getElementById("addRecIng").onclick=()=>{this.newIngredient()},document.getElementById("editRecipePrice").value=e.price,document.getElementById("editRecipeSubmit").onclick=()=>{this.submit(e)},document.getElementById("editRecipeCancel").onclick=()=>{controller.openSidebar("recipeDetails",e)}},newIngredient:function(){let e=document.getElementById("editRecipeIngList"),t=document.getElementById("editRecipeIng").content.children[0].cloneNode(!0);t.children[0].onclick=()=>{t.parentNode.removeChild(t)},t.children[1].style.display="none",t.children[3].value="0.00";let n=merchant.categorizeIngredients();for(let i=0;i<n.length;i++){let e=document.createElement("optgroup");e.label=n[i].name;for(let t=0;t<n[i].ingredients.length;t++){let r=document.createElement("option");r.innerText=n[i].ingredients[t].ingredient.getNameAndUnit(),r.ingredient=n[i].ingredients[t],e.appendChild(r)}t.children[2].appendChild(e)}e.appendChild(t)},submit:function(e){let t={id:e.id,name:e.name,price:100*document.getElementById("editRecipePrice").value,ingredients:[]};"none"===merchant.pos&&(t.name=document.getElementById("editRecipeName").value);let n=document.getElementById("editRecipeIngList").children;for(let r=0;r<n.length;r++){const e=parseFloat(n[r].children[3].value);if("none"===n[r].children[1].style.display){let i=n[r].children[2],s=i.options[i.selectedIndex].ingredient;t.ingredients.push({ingredient:s.ingredient.id,quantity:s.convertToBase(e)})}else t.ingredients.push({ingredient:n[r].ingredient.ingredient.id,quantity:n[r].ingredient.convertToBase(e)})}let i=document.getElementById("loaderContainer");i.style.display="flex",fetch("/recipe/update",{method:"put",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(t)}).then(e=>e.json()).then(e=>{"string"==typeof e?banner.createError(e):(merchant.updateRecipe(e),controller.openStrand("recipeBook"),banner.createNotification("RECIPE UPDATED"))}).catch(e=>{banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE")}).finally(()=>{i.style.display="none"})}};var g={display:function(e){let t=document.getElementById("newTransactionRecipes"),n=document.getElementById("createTransaction").content.children[0];for(;t.children.length>0;)t.removeChild(t.firstChild);for(let i=0;i<merchant.recipes.length;i++){let e=n.cloneNode(!0);e.recipe=merchant.recipes[i],t.appendChild(e),e.children[0].innerText=merchant.recipes[i].name}document.getElementById("submitNewTransaction").onclick=()=>{this.submit(e)}},submit:function(e){let t=document.getElementById("newTransactionRecipes"),n=document.getElementById("newTransactionDate").valueAsDate;if(n>new Date)return void banner.createError("CANNOT HAVE A DATE IN THE FUTURE");let i={date:n,recipes:[],ingredientUpdates:{}};for(let r=0;r<t.children.length;r++){let e=t.children[r].children[1].value;const n=t.children[r].recipe;if(""!==e&&e>0){i.recipes.push({recipe:n.id,quantity:e});for(let t=0;t<n.ingredients.length;t++){let r=n.ingredients[t];i.ingredientUpdates[r.ingredient.id]?i.ingredientUpdates[r.ingredient.id]+=r.convertToBase(r.quantity)*e:i.ingredientUpdates[r.ingredient.id]=r.convertToBase(r.quantity)*e}}else if(e<0)return void banner.createError("CANNOT HAVE NEGATIVE VALUES")}if(i.recipes.length>0){let t=document.getElementById("loaderContainer");t.style.display="flex",fetch("/transaction/create",{method:"post",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(i)}).then(e=>e.json()).then(t=>{if("string"==typeof t)banner.createError(t);else{const n=new e(t._id,t.date,t.recipes,merchant);merchant.addTransaction(n),controller.openStrand("transactions",merchant.getTransactions()),banner.createNotification("TRANSACTION CREATED")}}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{t.style.display="none"})}}};var p={display:function(e){document.getElementById("removeOrderBtn").onclick=()=>{this.remove(e)},document.getElementById("orderDetailName").innerText=e.name,document.getElementById("orderDetailDate").innerText=e.date.toLocaleDateString("en-US"),document.getElementById("orderDetailTax").innerText="$"+e.taxes.toFixed(2),document.getElementById("orderDetailFee").innerText="$"+e.fees.toFixed(2);let t=document.getElementById("orderIngredients");for(;t.children.length>0;)t.removeChild(t.firstChild);let n=document.getElementById("orderIngredient").content.children[0];for(let i=0;i<e.ingredients.length;i++){let r=n.cloneNode(!0);const s=e.ingredients[i].ingredient;r.children[0].innerText=e.ingredients[i].ingredient.name,r.children[2].innerText="$"+e.ingredients[i].cost().toFixed(2),r.onclick=()=>{controller.openStrand("ingredients"),controller.openSidebar("ingredientDetails",merchant.getIngredient(e.ingredients[i].ingredient.id))};let a=r.children[1];"bottle"===s.specialUnit?a.innerText=`${e.ingredients[i].quantity.toFixed(2)} bottles x $${e.ingredients.pricePerUnit.toFixed(2)}`:a.innerText=`${e.ingredients[i].quantity.toFixed(2)} ${s.unit.toUpperCase()} X $${e.ingredients[i].pricePerUnit.toFixed(2)}`,t.appendChild(r)}document.getElementById("orderDetailTotal").innerText="$"+e.getIngredientCost().toFixed(2),document.querySelector("#orderTotalPrice p").innerText="$"+e.getTotalCost().toFixed(2)},remove:function(e){let t=document.getElementById("loaderContainer");t.style.display="flex",fetch("/order/"+e.id,{method:"DELETE",headers:{"Content-Type":"application/json;charset=utf-8"}}).then(e=>e.json()).then(t=>{"string"==typeof t?banner.createError(t):(merchant.removeOrder(e),controller.openStrand("orders",merchant.orders),banner.createNotification("ORDER REMOVED"))}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{t.style.display="none"})}};var m={display:function(e){let t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()-30),i=document.getElementById("orderFilterIngredients");for(document.getElementById("orderFilterDateFrom").valueAsDate=n,document.getElementById("orderFilterDateTo").valueAsDate=t;i.children.length>0;)i.removeChild(i.firstChild);for(let r=0;r<merchant.ingredients.length;r++){let e=document.createElement("div");e.classList.add("choosable"),e.ingredient=merchant.ingredients[r].ingredient.id,e.onclick=()=>{this.toggleActive(e)},i.appendChild(e);let t=document.createElement("p");t.innerText=merchant.ingredients[r].ingredient.name,e.appendChild(t)}document.getElementById("orderFilterSubmit").onclick=()=>{this.submit(e)}},toggleActive:function(e){e.classList.contains("active")?e.classList.remove("active"):e.classList.add("active")},submit:function(e){let t={startDate:document.getElementById("orderFilterDateFrom").valueAsDate,endDate:document.getElementById("orderFilterDateTo").valueAsDate,ingredients:[]};if(t.startDate>=t.endDate)return void banner.createError("START DATE CANNOT BE AFTER END DATE");let n=document.getElementById("orderFilterIngredients").children;for(let r=0;r<n.length;r++)n[r].classList.contains("active")&&t.ingredients.push(n[r].ingredient);if(0===t.ingredients.length)for(let r=0;r<merchant.ingredients.length;r++)t.ingredients.push(merchant.ingredients[r].ingredient.id);let i=document.getElementById("loaderContainer");i.style.display="flex",fetch("/order",{method:"post",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(t)}).then(e=>e.json()).then(t=>{let n=[];if("string"==typeof t)banner.createError(t);else if(0===t.length)banner.createError("NO ORDERS MATCH YOUR SEARCH");else for(let i=0;i<t.length;i++)n.push(new e(t[i]._id,t[i].name,t[i].date,t[i].taxes,t[i].fees,t[i].ingredients,merchant));controller.openStrand("orders",n)}).catch(e=>{banner.createError("UNABLE TO DISPLAY THE ORDERS")}).finally(()=>{i.style.display="none"})}};var y={display:function(e){document.getElementById("editRecipeBtn").onclick=()=>{controller.openSidebar("editRecipe",e)},document.getElementById("recipeName").innerText=e.name,"none"===merchant.pos&&(document.getElementById("removeRecipeBtn").onclick=()=>{this.remove(e)});let t=document.getElementById("recipeIngredientList");for(;t.children.length>0;)t.removeChild(t.firstChild);let n=document.getElementById("recipeIngredient").content.children[0];for(let i=0;i<e.ingredients.length;i++){let r=n.cloneNode(!0);r.children[0].innerText=e.ingredients[i].ingredient.name,r.children[1].innerText=""+e.ingredients[i].getQuantityDisplay(),r.onclick=()=>{controller.openStrand("ingredients"),controller.openSidebar("ingredientDetails",merchant.getIngredient(e.ingredients[i].ingredient.id))},t.appendChild(r)}document.getElementById("recipePrice").children[1].innerText="$"+e.price.toFixed(2)},remove:function(e){let t=document.getElementById("loaderContainer");t.style.display="flex",fetch("/recipe/remove/"+e.id,{method:"delete"}).then(e=>e.json()).then(t=>{"string"==typeof t?banner.createError(t):(merchant.removeRecipe(e),banner.createNotification("RECIPE REMOVED"),controller.openStrand("recipeBook"))}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{t.style.display="none"})}};var E={transaction:{},display:function(e){this.transaction=e;let t=document.getElementById("transactionRecipes"),n=document.getElementById("transactionRecipe").content.children[0],i=0,r=0;for(;t.children.length>0;)t.removeChild(t.firstChild);for(let a=0;a<e.recipes.length;a++){let s=n.cloneNode(!0),d=e.recipes[a].quantity*e.recipes[a].recipe.price;s.children[0].innerText=e.recipes[a].recipe.name,s.children[1].innerText=`${e.recipes[a].quantity} x $${e.recipes[a].recipe.price.toFixed(2)}`,s.children[2].innerText="$"+d.toFixed(2),s.onclick=()=>{controller.openStrand("recipeBook"),controller.openSidebar("recipeDetails",e.recipes[a].recipe)},t.appendChild(s),i+=e.recipes[a].quantity,r+=d}let s=`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][e.date.getDay()]}, ${["January","February","March","April","May","June","July","August","September","October","November","December"][e.date.getMonth()]} ${e.date.getDate()}, ${e.date.getFullYear()}`;document.getElementById("transactionDate").innerText=s,document.getElementById("transactionTime").innerText=e.date.toLocaleTimeString(),document.getElementById("totalRecipes").innerText=i+" recipes",document.getElementById("totalPrice").innerText="$"+r.toFixed(2),"none"===merchant.pos&&(document.getElementById("removeTransBtn").onclick=()=>{this.remove()})},remove:function(){let e=document.getElementById("loaderContainer");e.style.display="flex",fetch("/transaction/"+this.transaction.id,{method:"delete",headers:{"Content-Type":"application/json;charset=utf-8"}}).then(e=>{"string"==typeof e?banner.createError(e):(merchant.removeTransaction(this.transaction),controller.openStrand("transactions",merchant.getTransactions()),banner.createNotification("TRANSACTION REMOVED"))}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{e.style.display="none"})}};class f{constructor(e,t){return t<0?(banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER"),!1):t%1!=0?(banner.createError("RECIPES WITHIN A TRANSACTION MUST BE WHOLE NUMBERS"),!1):(this._recipe=e,void(this._quantity=t))}get recipe(){return this._recipe}get quantity(){return this._quantity}}var I=class{constructor(e,t,n,i){if((t=new Date(t))>new Date)return banner.createError("DATE CANNOT BE SET TO THE FUTURE"),!1;this._id=e,this._parent=i,this._date=t,this._recipes=[];for(let r=0;r<n.length;r++)for(let e=0;e<i.recipes.length;e++)if(n[r].recipe===i.recipes[e].id){const t=new f(i.recipes[e],n[r].quantity);this._recipes.push(t);break}}get id(){return this._id}get parent(){return this._parent}get date(){return this._date}get recipes(){return this._recipes}};var T={display:function(){let e=new Date,t=new Date(e);t.setMonth(e.getMonth()-1),document.getElementById("transFilterDateStart").valueAsDate=t,document.getElementById("transFilterDateEnd").valueAsDate=e;let n=document.getElementById("transFilterRecipeList");for(;n.children.length>0;)n.removeChild(n.firstChild);for(let i=0;i<merchant.recipes.length;i++){let e=document.createElement("div");e.innerText=merchant.recipes[i].name,e.recipe=merchant.recipes[i],e.classList.add("choosable"),e.onclick=()=>{this.toggleActive(e)},n.appendChild(e)}document.getElementById("transFilterSubmit").onclick=()=>{this.submit()}},toggleActive:function(e){e.classList.contains("active")?e.classList.remove("active"):e.classList.add("active")},submit:function(){let e={startDate:document.getElementById("transFilterDateStart").valueAsDate,endDate:document.getElementById("transFilterDateEnd").valueAsDate,recipes:[]};if(e.startDate>=e.endDate)return void banner.createError("START DATE CANNOT BE AFTER END DATE");let t=document.getElementById("transFilterRecipeList").children;for(let i=0;i<t.length;i++)t[i].classList.contains("active")&&e.recipes.push(t[i].recipe.id);if(0===e.recipes.length)for(let i=0;i<merchant.recipes.length;i++)e.recipes.push(merchant.recipes[i].id);let n=document.getElementById("loaderContainer");n.style.display="flex",fetch("/transaction",{method:"post",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(e)}).then(e=>e.json()).then(e=>{let t=[];if("string"==typeof e)banner.createError(e);else if(0===e.length)banner.createError("NO TRANSACTIONS MATCH YOUR SEARCH");else for(let n=0;n<e.length;n++)t.push(new I(e[n]._id,e[n].date,e[n].recipes,merchant));controller.openStrand("transactions",t)}).catch(e=>{banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE")}).finally(()=>{n.style.display="none"})}};class _{constructor(e,t){if(t<0)return banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER"),!1;this._quantity=t,this._ingredient=e}get ingredient(){return this._ingredient}get quantity(){if("bottle"===this._ingredient.specialUnit)return this._quantity/this._ingredient._unitSize;switch(this._ingredient.unit){case"g":return this._quantity;case"kg":return this._quantity/1e3;case"oz":return this._quantity/28.3495;case"lb":return this._quantity/453.5924;case"ml":return 1e3*this._quantity;case"l":return this._quantity;case"tsp":return 202.8842*this._quantity;case"tbsp":return 67.6278*this._quantity;case"ozfl":return 33.8141*this._quantity;case"cup":return 4.1667*this._quantity;case"pt":return 2.1134*this._quantity;case"qt":return 1.0567*this._quantity;case"gal":return this._quantity/3.7854;case"mm":return 1e3*this._quantity;case"cm":return 100*this._quantity;case"m":return this._quantity;case"in":return 39.3701*this._quantity;case"ft":return 3.2808*this._quantity;default:return this._quantity}}updateQuantity(e){this._quantity+=this.convertToBase(e)}convertToBase(e){switch(this._ingredient.unit){case"g":return e;case"kg":return 1e3*e;case"oz":return 28.3495*e;case"lb":return 453.5924*e;case"ml":return e/1e3;case"l":return e;case"tsp":return e/202.8842;case"tbsp":return e/67.6278;case"ozfl":return e/33.8141;case"cup":return e/4.1667;case"pt":return e/2.1134;case"qt":return e/1.0567;case"gal":return 3.7854*e;case"mm":return e/1e3;case"cm":return e/100;case"m":return e;case"in":return e/39.3701;case"ft":return e/3.2808;default:return e}}getQuantityDisplay(){return"bottle"===this._ingredient.specialUnit?this.quantity.toFixed(2)+" BOTTLES":`${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`}}class B{constructor(e,t){if(t<0)return banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER"),!1;this._ingredient=e,this._quantity=t}get ingredient(){return this._ingredient}get quantity(){if("bottle"===this._ingredient.specialUnit)return this._quantity/this._ingredient.unitSize;switch(this._ingredient.unit){case"g":return this._quantity;case"kg":return this._quantity/1e3;case"oz":return this._quantity/28.3495;case"lb":return this._quantity/453.5924;case"ml":return 1e3*this._quantity;case"l":return this._quantity;case"tsp":return 202.8842*this._quantity;case"tbsp":return 67.6278*this._quantity;case"ozfl":return 33.8141*this._quantity;case"cup":return 4.1667*this._quantity;case"pt":return 2.1134*this._quantity;case"qt":return 1.0567*this._quantity;case"gal":return this._quantity/3.7854;case"mm":return 1e3*this._quantity;case"cm":return 100*this._quantity;case"m":return this._quantity;case"in":return 39.3701*this._quantity;case"ft":return 3.2808*this._quantity;default:return this._quantity}}set quantity(e){if(e<0)return banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER"),!1;this_quantity=this.convertToBase(e)}getQuantityDisplay(){return"bottle"===this._ingredient.specialUnit?this.quantity.toFixed(2)+" BOTTLES":`${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`}convertToBase(e){switch(this._ingredient.unit){case"g":return e;case"kg":return 1e3*e;case"oz":return 28.3495*e;case"lb":return 453.5924*e;case"ml":return e/1e3;case"l":return e;case"tsp":return e/202.8842;case"tbsp":return e/67.6278;case"ozfl":return e/33.8141;case"cup":return e/4.1667;case"pt":return e/2.1134;case"qt":return e/1.0567;case"gal":return 3.7854*e;case"mm":return e/1e3;case"cm":return e/100;case"m":return e;case"in":return e/39.3701;case"ft":return e/3.2808;default:return e}}}var b=class{constructor(e,t,n,i,r){if(n<0)return banner.createError("PRICE CANNOT BE A NEGATIVE NUMBER"),!1;if(!this.isSanitaryString(t))return banner.createError("NAME CONTAINS ILLEGAL CHARACTERS"),!1;this._id=e,this._name=t,this._price=n,this._parent=r,this._ingredients=[];for(let s=0;s<i.length;s++){const e=new B(i[s].ingredient,i[s].quantity);this._ingredients.push(e)}}get id(){return this._id}get name(){return this._name}set name(e){if(!this.isSanitaryString(e))return!1;this._name=e}get price(){return this._price/100}set price(e){if(e<0)return!1;this._price=e}get parent(){return this._parent}get ingredients(){return this._ingredients}addIngredient(e,t){if(t<0)return banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER"),!1;let n=new B(e,t);this._ingredients.push(n),this._parent.modules.recipeBook.isPopulated=!1,this._parent.modules.analytics.isPopulated=!1}removeIngredients(){this._ingredients=[]}isSanitaryString(e){let t=["\\","<",">","$","{","}","(",")"];for(let n=0;n<t.length;n++)if(e.includes(t[n]))return!1;return!0}};class S{constructor(e,t,n){if(t<0)return!1;this._ingredient=e,this._quantity=t,this._pricePerUnit=n}get ingredient(){return this._ingredient}get quantity(){if("bottle"===this._ingredient.specialUnit)return this._quantity/this._ingredient.unitSize;switch(this._ingredient.unit){case"g":return this._quantity;case"kg":return this._quantity/1e3;case"oz":return this._quantity/28.3495;case"lb":return this._quantity/453.5924;case"ml":return 1e3*this._quantity;case"l":return this._quantity;case"tsp":return 202.8842*this._quantity;case"tbsp":return 67.6278*this._quantity;case"ozfl":return 33.8141*this._quantity;case"cup":return 4.1667*this._quantity;case"pt":return 2.1134*this._quantity;case"qt":return 1.0567*this._quantity;case"gal":return this._quantity/3.7854;case"mm":return 1e3*this._quantity;case"cm":return 100*this._quantity;case"m":return this._quantity;case"in":return 39.3701*this._quantity;case"ft":return 3.2808*this._quantity;default:return this._quantity}}updateQuantity(e){if(e<0)return!1;this._quantity+=this.convertToBase(e)}convertToBase(e){switch(this._ingredient.unit){case"g":return e;case"kg":return 1e3*e;case"oz":return 28.3495*e;case"lb":return 453.5924*e;case"ml":return e/1e3;case"l":return e;case"tsp":return e/202.8842;case"tbsp":return e/67.6278;case"ozfl":return e/33.8141;case"cup":return e/4.1667;case"pt":return e/2.1134;case"qt":return e/1.0567;case"gal":return 3.7854*e;case"mm":return e/1e3;case"cm":return e/100;case"m":return e;case"in":return e/39.3701;case"ft":return e/3.2808;default:return e}}get pricePerUnit(){if("bottle"===this._ingredient.specialUnit)return this._pricePerUnit*this._ingredient.unitSize/100;switch(this._ingredient.unit){case"g":return this._pricePerUnit/100;case"kg":return 1e3*this._pricePerUnit/100;case"oz":return 28.3495*this._pricePerUnit/100;case"lb":return 453.5924*this._pricePerUnit/100;case"ml":return this._pricePerUnit/1e3/100;case"l":return this._pricePerUnit/100;case"tsp":return this._pricePerUnit/202.8842/100;case"tbsp":return this._pricePerUnit/67.6278/100;case"ozfl":return this._pricePerUnit/33.8141/100;case"cup":return this._pricePerUnit/4.1667/100;case"pt":return this._pricePerUnit/2.1134/100;case"qt":return this._pricePerUnit/1.0567/100;case"gal":return 3.7854*this._pricePerUnit/100;case"mm":return this._pricePerUnit/1e3/100;case"cm":return this._pricePerUnit/100/100;case"m":return this._pricePerUnit/100;case"in":return this._pricePerUnit/39.3701/100;case"ft":return this._pricePerUnit/3.2808/100}}cost(){return this._quantity*this._pricePerUnit/100}}var v=class{constructor(e,t,n,i,r,s,a){if(!this.isSanitaryString(t))return!1;if(i<0)return!1;if(this._id=e,this._name=t,this._date=new Date(n),this._taxes=i,this._fees=r,this._ingredients=[],this._parent=a,n>new Date)return!1;for(let d=0;d<s.length;d++)for(let e=0;e<merchant.ingredients.length;e++)if(merchant.ingredients[e].ingredient.id===s[d].ingredient){this._ingredients.push(new S(merchant.ingredients[e].ingredient,s[d].quantity,s[d].pricePerUnit));break}this._parent.modules.ingredients.isPopulated=!1}get id(){return this._id}get name(){return this._name}get date(){return this._date}get taxes(){return this._taxes/100}get fees(){return this._fees/100}get parent(){return this._parent}get ingredients(){return this._ingredients}getIngredientCost(){let e=0;for(let t=0;t<this._ingredients.length;t++)e+=this._ingredients[t].cost();return e}getTotalCost(){return this.getIngredientCost()+this.taxes+this.fees}isSanitaryString(e){let t=["\\","<",">","$","{","}","(",")"];for(let n=0;n<t.length;n++)if(e.includes(t[n]))return!1;return!0}};merchant=new class{constructor(e,t,n){this._modules=n,this._name=e.name,this._pos=e.pos,this._ingredients=[],this._recipes=[],this._transactions=[],this._orders=[],this._units={mass:["g","kg","oz","lb"],volume:["ml","l","tsp","tbsp","ozfl","cup","pt","qt","gal"],length:["mm","cm","m","in","ft"],other:["each","bottle"]};for(let i=0;i<e.inventory.length;i++){const t=new n.Ingredient(e.inventory[i].ingredient._id,e.inventory[i].ingredient.name,e.inventory[i].ingredient.category,e.inventory[i].ingredient.unitType,e.inventory[i].defaultUnit,this,e.inventory[i].ingredient.specialUnit,e.inventory[i].ingredient.unitSize),r=new _(t,e.inventory[i].quantity);this._ingredients.push(r)}for(let i=0;i<e.recipes.length;i++){let t=[];for(let n=0;n<e.recipes[i].ingredients.length;n++){const r=e.recipes[i].ingredients[n];for(let e=0;e<this._ingredients.length;e++)if(r.ingredient===this._ingredients[e].ingredient.id){t.push({ingredient:this._ingredients[e].ingredient,quantity:r.quantity});break}}this._recipes.push(new this._modules.Recipe(e.recipes[i]._id,e.recipes[i].name,e.recipes[i].price,t,this))}for(let i=0;i<t.length;i++)this._transactions.push(new n.Transaction(t[i]._id,t[i].date,t[i].recipes,this))}get modules(){return this._modules}get name(){return this._name}set name(e){return this.isSanitaryString(e)&&(this._name=e),!1}get pos(){return this._pos}get ingredients(){return this._ingredients}addIngredient(e,t){const n=new _(e,t);this._ingredients.push(n),this._modules.home.isPopulated=!1,this._modules.ingredients.isPopulated=!1}removeIngredient(e){const t=this._ingredients.indexOf(e);if(void 0===t)return!1;this._ingredients.splice(t,1),this._modules.home.isPopulated=!1,this._modules.ingredients.isPopulated=!1}updateIngredient(e,t){const n=this._ingredients.indexOf(e);if(void 0===n)return!1;this._ingredients[n].quantity=t,this._modules.home.isPopulated=!1,this._modules.ingredients.isPopulated=!1}getIngredient(e){for(let t=0;t<this._ingredients.length;t++)if(this._ingredients[t].ingredient.id===e)return this._ingredients[t]}get recipes(){return this._recipes}addRecipe(e){this._recipes.push(e),this._modules.recipeBook.isPopulated=!1}removeRecipe(e){const t=this._recipes.indexOf(e);if(void 0===t)return!1;this._recipes.splice(t,1),this._modules.recipeBook.isPopulated=!1}updateRecipe(e){for(let t=0;t<this._recipes.length;t++)if(this._recipes[t].id===e._id){this._recipes[t].name=e.name,this._recipes[t].price=e.price,this._recipes[t].removeIngredients();for(let n=0;n<e.ingredients.length;n++)for(let i=0;i<this._ingredients.length;i++)if(this._ingredients[i].ingredient.id===e.ingredients[n].ingredient){this._recipes[t].addIngredient(this._ingredients[i].ingredient,e.ingredients[n].quantity);break}break}this._modules.recipeBook.isPopulated=!1}getTransactions(e=0,t=new Date){if(merchant._transactions.length<=0)return[];0===e&&(e=this._transactions[this._transactions.length-1].date);const{start:n,end:i}=this.getTransactionIndices(e,t);return this._transactions.slice(n,i+1)}addTransaction(e){this._transactions.push(e),this._transactions.sort((e,t)=>e.date>t.date?-1:1);let t={};for(let i=0;i<e.recipes.length;i++){const n=e.recipes[i];for(let e=0;e<n.recipe.ingredients.length;e++){const i=n.recipe.ingredients[e];t[i.ingredient.id]?t[i.ingredient.id]+=n.quantity*i.quantity:t[i.ingredient.id]=n.quantity*i.quantity}}const n=Object.keys(t);for(let i=0;i<n.length;i++)for(let e=0;e<this._ingredients.length;e++)n[i]===this._ingredients[e].ingredient.id&&this._ingredients[e].updateQuantity(-t[n[i]]);this._modules.home.isPopulated=!1,this._modules.ingredients.isPopulated=!1,this._modules.analytics.newData=!0}removeTransaction(e){const t=this._transactions.indexOf(e);if(void 0===t)return!1;this._transactions.splice(t,1);let n={};for(let r=0;r<e.recipes.length;r++){const t=e.recipes[r];for(let e=0;e<t.recipe.ingredients.length;e++){const i=t.recipe.ingredients[e];n[i.ingredient.id]?n[i.ingredient.id]+=i.quantity*t.quantity:n[i.ingredient.id]=i.quantity*t.quantity}}const i=Object.keys(n);for(let r=0;r<i.length;r++)for(let e=0;e<this._ingredients.length;e++)if(i[r]===this._ingredients[e].ingredient.id){this._ingredients[e].updateQuantity(n[i[r]]);break}this._modules.home.isPopulated=!1,this._modules.ingredients.isPopulated=!1,this._modules.analytics.newData=!0}get orders(){return this._orders}addOrder(e,t=!1){if(this._orders.push(e),t)for(let n=0;n<e.ingredients.length;n++)for(let t=0;t<this._ingredients.length;t++)if(e.ingredients[n].ingredient===this._ingredients[t].ingredient){this._ingredients[t].updateQuantity(e.ingredients[n].quantity);break}this._modules.ingredients.isPopulated=!1,this._modules.orders.isPopulated=!1}setOrders(e){this._orders=e}removeOrder(e){const t=this._orders.indexOf(e);if(void 0===t)return!1;this._orders.splice(t,1);for(let n=0;n<e.ingredients.length;n++)for(let t=0;t<this._ingredients.length;t++)if(e.ingredients[n].ingredient===this._ingredients[t].ingredient){this._ingredients[t].updateQuantity(-e.ingredients[n].quantity);break}this._modules.ingredients.isPopulated=!1,this._modules.orders.isPopulated=!1}get units(){return this._units}getRevenue(e,t=new Date){0===e&&(e=this._transactions[0].date);const{start:n,end:i}=this.getTransactionIndices(e,t);let r=0;for(let s=n;s<=i;s++)for(let e=0;e<this._transactions[s].recipes.length;e++)for(let t=0;t<this.recipes.length;t++)this._transactions[s].recipes[e].recipe===this.recipes[t]&&(r+=this._transactions[s].recipes[e].quantity*this.recipes[t].price);return r/100}getIngredientsSold(e=0,t=new Date){(e=0)&&(e=this._ingredients[0].date);let n=this.getRecipesSold(e,t),i=[];for(let r=0;r<n.length;r++)for(let e=0;e<n[r].recipe.ingredients.length;e++){let t=!1;for(let s=0;s<i.length;s++)i[s].ingredient===n[r].recipe.ingredients[e].ingredient&&(t=!0,i[s].quantity+=n[r].quantity*n[r].recipe.ingredients[e].quantity);t||i.push({ingredient:n[r].recipe.ingredients[e].ingredient,quantity:n[r].quantity*n[r].recipe.ingredients[e].quantity})}return i}getSingleIngredientSold(e,t=0,n=new Date){0===t&&(t=this._transactions[0].date);const{start:i,end:r}=this.getTransactionIndices(t,n);let s=0;for(let a=i;a<r;a++)for(let t=0;t<this._transactions[a].recipes.length;t++)for(let n=0;n<this._transactions[a].recipes[t].recipe.ingredients.length;n++)if(this._transactions[a].recipes[t].recipe.ingredients[n].ingredient===e.ingredient){s+=this._transactions[a].recipes[t].recipe.ingredients[n].quantity;break}return s}getRecipesSold(e=0,t=new Date){(e=0)&&(e=this._transactions[0].date);const{start:n,end:i}=this.getTransactionIndices(e,t);let r=[];for(let s=n;s<=i;s++)for(let e=0;e<this._transactions[s].recipes.length;e++){let t=!1;for(let n=0;n<r.length;n++)if(r[n].recipe===this._transactions[s].recipes[e].recipe){t=!0,r[n].quantity+=this._transactions[s].recipes[e].quantity;break}t||r.push({recipe:this._transactions[s].recipes[e].recipe,quantity:this._transactions[s].recipes[e].quantity})}return r}categorizeIngredients(){let e=[];for(let t=0;t<this.ingredients.length;t++){let n=!1;for(let i=0;i<e.length;i++)if(this.ingredients[t].ingredient.category===e[i].name){e[i].ingredients.push(this.ingredients[t]),n=!0;break}n||e.push({name:this.ingredients[t].ingredient.category,ingredients:[this.ingredients[t]]})}return e}unitizeIngredients(){let e=[];for(let t=0;t<this.ingredients.length;t++){let n=!1;const i=this.ingredients[t].ingredient;for(let r=0;r<e.length;r++)if(i.unit===e[r].name||i.specialUnit===e[r].name){e[r].ingredients.push(this.ingredients[t]),n=!0;break}if(!n){let n="";n="bottle"===i.specialUnit?"bottle":i.unit,e.push({name:n,ingredients:[this.ingredients[t]]})}}return e}getRecipesForIngredient(e){let t=[];for(let n=0;n<this._recipes.length;n++)for(let i=0;i<this._recipes[n].ingredients.length;i++)if(this._recipes[n].ingredients[i].ingredient===e){t.push(this._recipes[n]);break}return t}getTransactionIndices(e,t){let n,i;t.setDate(t.getDate()+1);for(let r=this._transactions.length-1;r>=0;r--)if(this._transactions[r].date>=e){n=r;break}for(let r=0;r<this._transactions.length;r++)if(this._transactions[r].date<t){i=r;break}return void 0!==n&&{start:i,end:n}}isSanitaryString(e){let t=["\\","<",">","$","{","}","(",")"];for(let n=0;n<t.length;n++)if(e.includes(t[n]))return!1;return!0}}(data.merchant,data.transactions,{home:e,ingredients:t,transactions:s,recipeBook:n,analytics:i,orders:r,Ingredient:l,Recipe:b,Transaction:I}),controller={openStrand:function(a,d){this.closeSidebar();let l=document.querySelectorAll(".strand");for(let e=0;e<l.length;e++)l[e].style.display="none";let c=document.querySelectorAll(".menuButton");for(let e=0;e<c.length-1;e++)c[e].classList="menuButton",c[e].disabled=!1;let o={};switch(a){case"home":o=document.getElementById("homeBtn"),document.getElementById("homeStrand").style.display="flex",e.display();break;case"ingredients":o=document.getElementById("ingredientsBtn"),document.getElementById("ingredientsStrand").style.display="flex",t.display();break;case"recipeBook":o=document.getElementById("recipeBookBtn"),document.getElementById("recipeBookStrand").style.display="flex",n.display(b);break;case"analytics":o=document.getElementById("analyticsBtn"),document.getElementById("analyticsStrand").style.display="flex",i.display(I);break;case"orders":o=document.getElementById("ordersBtn"),document.getElementById("ordersStrand").style.display="flex",r.orders=d,r.display(v);break;case"transactions":o=document.getElementById("transactionsBtn"),document.getElementById("transactionsStrand").style.display="flex",s.transactions=d,s.display(I)}o.classList="menuButton active",o.disabled=!0,window.screen.availWidth<=1e3&&this.closeMenu()},openSidebar:function(e,n={}){switch(this.closeSidebar(),document.getElementById("sidebarDiv").classList="sidebar",document.getElementById(e).style.display="flex",e){case"ingredientDetails":a.display(n,t);break;case"newIngredient":d.display(l);break;case"editIngredient":c.display(n);break;case"recipeDetails":y.display(n);break;case"editRecipe":u.display(n);break;case"addRecipe":h.display(b);break;case"orderDetails":p.display(n);break;case"orderFilter":m.display(v);break;case"newOrder":o.display(v);break;case"transactionDetails":E.display(n);break;case"transactionFilter":T.display();break;case"newTransaction":g.display(I)}window.screen.availWidth<=1e3&&(document.querySelector(".contentBlock").style.display="none",document.getElementById("mobileMenuSelector").style.display="none",document.getElementById("sidebarCloser").style.display="block")},closeSidebar:function(){let e=document.getElementById("sidebarDiv");for(let t=0;t<e.children.length;t++)if("none"!==e.children[t].style.display){e.children[t].style.display="none";let n=[];switch(e.children[t].id){case"ingredientDetails":n=document.querySelectorAll(".ingredient");break;case"transactionDetails":n=document.getElementById("transactionsList").children;break;case"recipeDetails":n=document.getElementById("recipeList").children;break;case"orderDetails":n=document.getElementById("orderList").children}for(let e=0;e<n.length;e++)n[e].classList.remove("active")}e.classList="sidebarHide",window.screen.availWidth<=1e3&&(document.querySelector(".contentBlock").style.display="flex",document.getElementById("mobileMenuSelector").style.display="block",document.getElementById("sidebarCloser").style.display="none")},changeMenu:function(){let e=document.querySelector(".menu"),t=document.querySelectorAll(".menuButton");if(e.classList.contains("menuMinimized")){if(e.classList.contains("menuMinimized")){e.classList="menu";for(let e=0;e<t.length;e++)t[e].children[1].style.display="block";setTimeout(()=>{document.getElementById("max").style.display="flex",document.getElementById("min").style.display="none"},150)}}else{e.classList="menu menuMinimized";for(let e=0;e<t.length;e++)t[e].children[1].style.display="none";document.getElementById("max").style.display="none",document.getElementById("min").style.display="flex"}},openMenu:function(){document.getElementById("menu").style.display="flex",document.querySelector(".contentBlock").style.display="none",document.getElementById("mobileMenuSelector").onclick=()=>{this.closeMenu()}},closeMenu:function(){document.getElementById("menu").style.display="none",document.querySelector(".contentBlock").style.display="flex",document.getElementById("mobileMenuSelector").onclick=()=>{this.openMenu()}},reconvertPrice(e,t,n){if("mass"===e)switch(t){case"g":break;case"kg":n*=1e3;break;case"oz":n*=28.3495;break;case"lb":n*=453.5924}else if("volume"===e)switch(t){case"ml":n/=1e3;break;case"l":break;case"tsp":n/=202.8842;break;case"tbsp":n/=67.6278;break;case"ozfl":n/=33.8141;break;case"cup":n/=4.1667;break;case"pt":n/=2.1134;break;case"qt":n/=1.0567;break;case"gal":n*=3.7854}else if("length"===e)switch(t){case"mm":n/=1e3;break;case"cm":n/=100;break;case"m":break;case"in":n/=39.3701;break;case"ft":n/=3.2808}return n}},window.screen.availWidth>1e3&&window.screen.availWidth<=1400&&(this.changeMenu(),document.getElementById("menuShifter2").style.display="none"),document.getElementById("homeBtn").onclick=()=>{controller.openStrand("home")},document.getElementById("ingredientsBtn").onclick=()=>{controller.openStrand("ingredients")},document.getElementById("recipeBookBtn").onclick=()=>{controller.openStrand("recipeBook")},document.getElementById("analyticsBtn").onclick=()=>{controller.openStrand("analytics")},document.getElementById("ordersBtn").onclick=async()=>{0===merchant.orders.length&&merchant.setOrders(await r.getOrders(v)),controller.openStrand("orders",merchant.orders)},document.getElementById("transactionsBtn").onclick=()=>{controller.openStrand("transactions",merchant.getTransactions())},controller.openStrand("home")}();
=======
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Ingredient{
    constructor(id, name, category, unitType, unit, parent, specialUnit = undefined, unitSize = undefined){
        if(!this.isSanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARCTERS");
            return false;
        }
        if(!this.isSanitaryString(category)){
            banner.createError("CATEGORY CONTAINS ILLEGAL CHARACTERS");
            return false;
        }

        this._id = id;
        this._name = name;
        this._category = category;
        this._unitType = unitType;
        this._unit = unit;
        this._parent = parent;
        if(specialUnit){
            this._specialUnit = specialUnit;
            this._unitSize = unitSize;
        }
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!this.isSanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get category(){
        return this._category;
    }

    set category(category){
        if(!this.isSanitaryString(category)){
            return false;
        }

        this._category = category;
    }

    get unitType(){
        return this._unitType;
    }

    get unit(){
        return this._unit;
    }

    set unit(unit){
        this._unit = unit;
    }

    get parent(){
        return this._parent;
    }

    get specialUnit(){
        return this._specialUnit;
    }

    get unitSize(){
        switch(this._unit){
            case "g":return this._unitSize; 
            case "kg": return this._unitSize / 1000;
            case "oz": return this._unitSize / 28.3495;
            case "lb": return this._unitSize / 453.5924;
            case "ml": return this._unitSize * 1000;
            case "l": return this._unitSize;
            case "tsp": return this._unitSize * 202.8842;
            case "tbsp": return this._unitSize * 67.6278;
            case "ozfl": return this._unitSize * 33.8141;
            case "cup": return this._unitSize * 4.1667;
            case "pt": return this._unitSize * 2.1134;
            case "qt": return this._unitSize * 1.0567;
            case "gal": return this._unitSize / 3.7854;
            case "mm": return this._unitSize * 1000;
            case "cm": return this._unitSize * 100;
            case "m": return this._unitSize;
            case "in": return this._unitSize * 39.3701;
            case "ft": return this._unitSize * 3.2808;
            default: return this._unitSize;
        }
    }

    set unitSize(unitSize){
        if(unitSize < 0){
            return false;
        }

        this._unitSize = unitSize;
    }

    getNameAndUnit(){
        if(this._specialUnit === "bottle"){
            return `${this._name} (BOTTLES)`;
        }

        return `${this._name} (${this._unit.toUpperCase()})`;
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Ingredient;
},{}],2:[function(require,module,exports){
class MerchantIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        
        this._quantity = quantity;
        this._ingredient = ingredient;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        if(this._ingredient.specialUnit === "bottle"){
            return this._quantity / this._ingredient._unitSize;
        }

        switch(this._ingredient.unit){
            case "g":return this._quantity; 
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "m": return this._quantity;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    updateQuantity(quantity){
        this._quantity += this.convertToBase(quantity);
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity * 1000;
            case "oz":  return quantity * 28.3495; 
            case "lb":  return quantity * 453.5924;
            case "ml": return quantity / 1000; 
            case "l": return quantity;
            case "tsp": return quantity / 202.8842; 
            case "tbsp": return quantity / 67.6278; 
            case "ozfl": return quantity / 33.8141; 
            case "cup": return quantity / 4.1667; 
            case "pt": return quantity / 2.1134; 
            case "qt": return quantity / 1.0567; 
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000; 
            case "cm": return quantity / 100; 
            case "m": return quantity;
            case "in": return quantity / 39.3701; 
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    }

    getQuantityDisplay(){
        if(this._ingredient.specialUnit === "bottle"){
            return `${this.quantity.toFixed(2)} BOTTLES`;
        }

        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
    }
}

class Merchant{
    constructor(oldMerchant, transactions, modules){
        this._modules = modules;
        this._name = oldMerchant.name;
        this._pos = oldMerchant.pos;
        this._ingredients = [];
        this._recipes = [];
        this._transactions = [];
        this._orders = [];
        this._units = {
            mass: ["g", "kg", "oz", "lb"],
            volume: ["ml", "l", "tsp", "tbsp", "ozfl", "cup", "pt", "qt", "gal"],
            length: ["mm", "cm", "m", "in", "ft"],
            other: ["each", "bottle"]
        }
        
        //populate ingredients
        for(let i = 0; i < oldMerchant.inventory.length; i++){
            const ingredient = new modules.Ingredient(
                oldMerchant.inventory[i].ingredient._id,
                oldMerchant.inventory[i].ingredient.name,
                oldMerchant.inventory[i].ingredient.category,
                oldMerchant.inventory[i].ingredient.unitType,
                oldMerchant.inventory[i].defaultUnit,
                this,
                oldMerchant.inventory[i].ingredient.specialUnit,
                oldMerchant.inventory[i].ingredient.unitSize
            );

            const merchantIngredient = new MerchantIngredient(
                ingredient,
                oldMerchant.inventory[i].quantity,
            );

            this._ingredients.push(merchantIngredient);
        }

        //populate recipes
        for(let i = 0; i < oldMerchant.recipes.length; i++){
            let ingredients = [];
            for(let j = 0; j < oldMerchant.recipes[i].ingredients.length; j++){
                const ingredient = oldMerchant.recipes[i].ingredients[j];
                for(let k = 0; k < this._ingredients.length; k++){
                    if(ingredient.ingredient === this._ingredients[k].ingredient.id){
                        ingredients.push({
                            ingredient: this._ingredients[k].ingredient,
                            quantity: ingredient.quantity
                        });
                        break;
                    }
                }
            }

            this._recipes.push(new this._modules.Recipe(
                oldMerchant.recipes[i]._id,
                oldMerchant.recipes[i].name,
                oldMerchant.recipes[i].price,
                ingredients,
                this
            ));
        }

        //populate transactions
        for(let i = 0; i < transactions.length; i++){
            this._transactions.push(new modules.Transaction(
                transactions[i]._id,
                transactions[i].date,
                transactions[i].recipes,
                this
            ));
        }
    }

    get modules(){
        return this._modules;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(this.isSanitaryString(name)){
            this._name = name;
        }
        return false;
    }

    get pos(){
        return this._pos;
    }

    get ingredients(){
        return this._ingredients;
    }

    addIngredient(ingredient, quantity){
        const merchantIngredient = new MerchantIngredient(ingredient, quantity);
        this._ingredients.push(merchantIngredient);

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    removeIngredient(ingredient){
        const index = this._ingredients.indexOf(ingredient);
        if(index === undefined){
            return false;
        }

        this._ingredients.splice(index, 1);

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    updateIngredient(ingredient, quantity){
        const index = this._ingredients.indexOf(ingredient);
        if(index === undefined){
            return false;
        }

        this._ingredients[index].quantity = quantity;

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
    }

    getIngredient(id){
        for(let i = 0; i < this._ingredients.length; i++){
            if(this._ingredients[i].ingredient.id === id){
                return this._ingredients[i];
            }
        }
    }

    get recipes(){
        return this._recipes;
    }

    addRecipe(recipe){
        this._recipes.push(recipe);

        this._modules.recipeBook.isPopulated = false;
    }

    removeRecipe(recipe){
        const index = this._recipes.indexOf(recipe);
        if(index === undefined){
            return false;
        }

        this._recipes.splice(index, 1);

        this._modules.recipeBook.isPopulated = false;
    }

    /*
    recipe = {
        name: required,
        price: required,
        ingredients: [{
            ingredient: id of ingredient,
            quantity: quantity of ingredient
        }]
    }
    */
    updateRecipe(recipe){
        for(let i = 0; i < this._recipes.length; i++){
            if(this._recipes[i].id === recipe._id){
                this._recipes[i].name = recipe.name;
                this._recipes[i].price = recipe.price;
                
                this._recipes[i].removeIngredients();
                for(let j = 0; j < recipe.ingredients.length; j++){
                    for(let k = 0; k < this._ingredients.length; k++){
                        if(this._ingredients[k].ingredient.id === recipe.ingredients[j].ingredient){
                            this._recipes[i].addIngredient(
                                this._ingredients[k].ingredient,
                                recipe.ingredients[j].quantity
                            );

                            break;
                        }
                    }
                }

                break;
            }
        }

        this._modules.recipeBook.isPopulated = false;
    }

    getTransactions(from = 0, to = new Date()){
        if(merchant._transactions.length <= 0){
            return [];
        }

        if(from === 0){
            from = this._transactions[this._transactions.length-1].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        return this._transactions.slice(start, end + 1);
    }

    addTransaction(transaction){
        this._transactions.push(transaction);
        this._transactions.sort((a, b)=>{
            if(a.date > b.date){
                return -1;
            }
            return 1;
        });

        let ingredients = {};
        for(let i = 0; i < transaction.recipes.length; i++){
            const recipe = transaction.recipes[i];
            for(let j = 0; j < recipe.recipe.ingredients.length; j++){
                const ingredient = recipe.recipe.ingredients[j];
                if(ingredients[ingredient.ingredient.id]){
                    ingredients[ingredient.ingredient.id] += recipe.quantity * ingredient.quantity;
                }else{
                    ingredients[ingredient.ingredient.id] = recipe.quantity * ingredient.quantity;
                }
            }
        }

        const keys = Object.keys(ingredients);
        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(keys[i] === this._ingredients[j].ingredient.id){
                    this._ingredients[j].updateQuantity(-ingredients[keys[i]]);
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
        this._modules.analytics.newData = true;
    }

    removeTransaction(transaction){
        const index = this._transactions.indexOf(transaction);
        if(index === undefined){
            return false;
        }

        this._transactions.splice(index, 1);

        let ingredients = {};
        for(let i = 0; i < transaction.recipes.length; i++){
            const recipe = transaction.recipes[i];
            for(let j = 0; j < recipe.recipe.ingredients.length; j++){
                const ingredient = recipe.recipe.ingredients[j];
                if(ingredients[ingredient.ingredient.id]){
                    ingredients[ingredient.ingredient.id] += ingredient.quantity * recipe.quantity;
                }else{
                    ingredients[ingredient.ingredient.id] = ingredient.quantity * recipe.quantity;
                }
            }
        }

        const keys = Object.keys(ingredients);
        for(let i = 0; i < keys.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(keys[i] === this._ingredients[j].ingredient.id){
                    this._ingredients[j].updateQuantity(ingredients[keys[i]]);
                    break;
                }
            }
        }

        this._modules.home.isPopulated = false;
        this._modules.ingredients.isPopulated = false;
        this._modules.analytics.newData = true;
    }

    get orders(){
        return this._orders;
    }

    addOrder(order, isNew = false){
        this._orders.push(order);

        if(isNew){
            for(let i = 0; i < order.ingredients.length; i++){
                for(let j = 0; j < this._ingredients.length; j++){
                    if(order.ingredients[i].ingredient === this._ingredients[j].ingredient){
                        this._ingredients[j].updateQuantity(order.ingredients[i].quantity);
                        break;
                    }
                }
            }
        }

        this._modules.ingredients.isPopulated = false;
        this._modules.orders.isPopulated = false;
    }

    setOrders(orders){
        this._orders = orders
    }

    removeOrder(order){
        const index = this._orders.indexOf(order);
        if(index === undefined){
            return false;
        }

        this._orders.splice(index, 1);

        for(let i = 0; i < order.ingredients.length; i++){
            for(let j = 0; j < this._ingredients.length; j++){
                if(order.ingredients[i].ingredient === this._ingredients[j].ingredient){
                    this._ingredients[j].updateQuantity(-order.ingredients[i].quantity);
                    break;
                }
            }
        }

        this._modules.ingredients.isPopulated = false;
        this._modules.orders.isPopulated = false;
    }

    get units(){
        return this._units;
    }

    getRevenue(from, to = new Date()){
        if(from === 0){
            from = this._transactions[0].date;
        }
        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i <= end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                for(let k = 0; k < this.recipes.length; k++){
                    if(this._transactions[i].recipes[j].recipe === this.recipes[k]){
                        total += this._transactions[i].recipes[j].quantity * this.recipes[k].price;
                    }
                }
            }
        }

        return total / 100;
    }

    /*
    Gets the quantity of each ingredient sold between two dates (dateRange)
    Inputs:
        dateRange: list containing a start date and an end date
    Return:
        [{
            ingredient: Ingredient object,
            quantity: quantity of ingredient sold in default unit
        }]
    */
    getIngredientsSold(from = 0, to = new Date()){
        if(from = 0){
            from = this._ingredients[0].date;
        }
        
        let recipes = this.getRecipesSold(from, to);
        let ingredientList = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < recipes[i].recipe.ingredients.length; j++){
                let exists = false;

                for(let k = 0; k < ingredientList.length; k++){
                    if(ingredientList[k].ingredient === recipes[i].recipe.ingredients[j].ingredient){
                        exists = true;
                        ingredientList[k].quantity += recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity;
                    }
                }

                if(!exists){
                    ingredientList.push({
                        ingredient: recipes[i].recipe.ingredients[j].ingredient,
                        quantity: recipes[i].quantity * recipes[i].recipe.ingredients[j].quantity
                    });
                }
            }
        }
    
        return ingredientList;
    }

    /*
    Gets the quantity of a single ingredient sold between two dates
    Inputs:
        ingredient = MerchantIngredient object to find
        from = start Date
        to = end Date
    return: quantity sold in default unit
    */
    getSingleIngredientSold(ingredient, from = 0, to = new Date()){
        if(from === 0){
            from = this._transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        let total = 0;
        for(let i = start; i < end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                for(let k = 0; k < this._transactions[i].recipes[j].recipe.ingredients.length; k++){
                    if(this._transactions[i].recipes[j].recipe.ingredients[k].ingredient === ingredient.ingredient){
                        total += this._transactions[i].recipes[j].recipe.ingredients[k].quantity;
                        break;
                    }
                }
            }
        }

        return total;
    }

    /*
    Gets the number of recipes sold between two dates (dateRange)
    Inputs:
        dateRange: array containing a start date and an end date
    Return:
        [{
            recipe: a recipe object
            quantity: quantity of the recipe sold
        }]
    */
    getRecipesSold(from = 0, to = new Date()){
        if(from = 0){
            from = this._transactions[0].date;
        }

        const {start, end} = this.getTransactionIndices(from, to);

        let recipeList = [];
        for(let i = start; i <= end; i++){
            for(let j = 0; j < this._transactions[i].recipes.length; j++){
                let exists = false;
                for(let k = 0; k < recipeList.length; k++){
                    if(recipeList[k].recipe === this._transactions[i].recipes[j].recipe){
                        exists = true;
                        recipeList[k].quantity += this._transactions[i].recipes[j].quantity;
                        break;
                    }
                }

                if(!exists){
                    recipeList.push({
                        recipe: this._transactions[i].recipes[j].recipe,
                        quantity: this._transactions[i].recipes[j].quantity
                    });
                }
            }
        }

        return recipeList;
    }
    
    /*
    Groups all of the merchant's ingredients by their category
    Return: [{
        name: category name,
        ingredients: [MerchantIngredient Object]
    }]
    */
    categorizeIngredients(){
        let ingredientsByCategory = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let categoryExists = false;
            for(let j = 0; j < ingredientsByCategory.length; j++){
                if(this.ingredients[i].ingredient.category === ingredientsByCategory[j].name){
                    ingredientsByCategory[j].ingredients.push(this.ingredients[i]);

                    categoryExists = true;
                    break;
                }
            }

            if(!categoryExists){
                ingredientsByCategory.push({
                    name: this.ingredients[i].ingredient.category,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByCategory;
    }

    unitizeIngredients(){
        let ingredientsByUnit = [];

        for(let i = 0; i < this.ingredients.length; i++){
            let unitExists = false;
            const innerIngredient = this.ingredients[i].ingredient;
            for(let j = 0; j < ingredientsByUnit.length; j++){
                if(innerIngredient.unit === ingredientsByUnit[j].name || innerIngredient.specialUnit === ingredientsByUnit[j].name){
                    ingredientsByUnit[j].ingredients.push(this.ingredients[i]);

                    unitExists = true;
                    break;
                }
            }

            if(!unitExists){
                let unit = "";
                if(innerIngredient.specialUnit === "bottle"){
                    unit = "bottle";
                }else{
                    unit = innerIngredient.unit;
                }

                ingredientsByUnit.push({
                    name: unit,
                    ingredients: [this.ingredients[i]]
                });
            }
        }

        return ingredientsByUnit;
    }

    getRecipesForIngredient(ingredient){
        let recipes = [];

        for(let i = 0; i < this._recipes.length; i++){
            for(let j = 0; j < this._recipes[i].ingredients.length; j++){
                if(this._recipes[i].ingredients[j].ingredient === ingredient){
                    recipes.push(this._recipes[i]);
                    break;
                }
            }
        }

        return recipes;
    }

    getTransactionIndices(from, to){
        let start, end;
        to.setDate(to.getDate() + 1);

        for(let i = this._transactions.length - 1; i >= 0; i--){
            if(this._transactions[i].date >= from){
                start = i;
                break;
            }
        }
        
        for(let i = 0; i < this._transactions.length; i++){
            if(this._transactions[i].date < to){
                end = i;
                break;
            }
        }

        if(start === undefined){
            return false;
        }

        //these are switched due to the order of the transactions in the merchant
        return {start: end, end: start};
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Merchant;
},{}],3:[function(require,module,exports){
class OrderIngredient{
    constructor(ingredient, quantity, pricePerUnit){
        if(quantity < 0){
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
        this._pricePerUnit = pricePerUnit;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        if(this._ingredient.specialUnit === "bottle"){
            return this._quantity / this._ingredient.unitSize;
        }

        switch(this._ingredient.unit){
            case "g":return this._quantity;
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "m": return this._quantity;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    updateQuantity(quantity){
        if(quantity < 0){
            return false;
        }

        this._quantity += this.convertToBase(quantity);
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity * 1000;
            case "oz":  return quantity * 28.3495; 
            case "lb":  return quantity * 453.5924;
            case "ml": return quantity / 1000; 
            case "l": return quantity;
            case "tsp": return quantity / 202.8842; 
            case "tbsp": return quantity / 67.6278; 
            case "ozfl": return quantity / 33.8141; 
            case "cup": return quantity / 4.1667; 
            case "pt": return quantity / 2.1134; 
            case "qt": return quantity / 1.0567; 
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000; 
            case "cm": return quantity / 100; 
            case "m": return quantity;
            case "in": return quantity / 39.3701; 
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    }

    get pricePerUnit(){
        if(this._ingredient.specialUnit === "bottle"){
            return (this._pricePerUnit * this._ingredient.unitSize) / 100;
        }

        switch(this._ingredient.unit){
            case "g": return this._pricePerUnit / 100;
            case "kg": return (this._pricePerUnit * 1000) / 100; 
            case "oz": return (this._pricePerUnit * 28.3495) / 100; 
            case "lb": return (this._pricePerUnit * 453.5924) / 100; 
            case "ml": return (this._pricePerUnit / 1000) / 100; 
            case "l": return this._pricePerUnit / 100;
            case "tsp": return (this._pricePerUnit / 202.8842) / 100; 
            case "tbsp": return (this._pricePerUnit / 67.6278) / 100; 
            case "ozfl": return (this._pricePerUnit / 33.8141) / 100; 
            case "cup": return (this._pricePerUnit / 4.1667) / 100; 
            case "pt": return (this._pricePerUnit / 2.1134) / 100; 
            case "qt": return (this._pricePerUnit / 1.0567) / 100; 
            case "gal": return (this._pricePerUnit * 3.7854) / 100; 
            case "mm": return (this._pricePerUnit / 1000) / 100; 
            case "cm": return (this._pricePerUnit / 100) / 100; 
            case "m": return this._pricePerUnit / 100;
            case "in": return (this._pricePerUnit / 39.3701) / 100; 
            case "ft": return (this._pricePerUnit / 3.2808) / 100; 
        }
    }

    cost(){
        return (this._quantity * this._pricePerUnit) / 100;
    }
        
}

/*
Order Object
id = id of order in the database
name = name/id of order, if any
date = Date Object for when the order was created
taxes = User entered taxes associated with the order
fees = User entered fees associated with the order
ingredients = [{
    ingredient: Ingredient Object,
    quantity: quantity of ingredient sold,
    pricePerUnit: price of purchase (per base unit)
}]
parent = the merchant that it belongs to
*/
class Order{
    constructor(id, name, date, taxes, fees, ingredients, parent){
        if(!this.isSanitaryString(name)){
            return false;
        }
        if(taxes < 0){
            return false;
        }

        this._id = id;
        this._name = name;
        this._date = new Date(date);
        this._taxes = taxes;
        this._fees = fees;
        this._ingredients = [];
        this._parent = parent;

        if(date > new Date()){
            return false;
        }

        for(let i = 0; i < ingredients.length; i++){
            for(let j = 0; j < merchant.ingredients.length; j++){
                if(merchant.ingredients[j].ingredient.id === ingredients[i].ingredient){
                    this._ingredients.push(new OrderIngredient(
                        merchant.ingredients[j].ingredient,
                        ingredients[i].quantity,
                        ingredients[i].pricePerUnit
                    ));
                    break;
                }
            }
            
        }

        this._parent.modules.ingredients.isPopulated = false;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    get date(){
        return this._date;
    }

    get taxes(){
        return this._taxes / 100;
    }

    get fees(){
        return this._fees / 100;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    getIngredientCost(){
        let sum = 0;
        for(let i = 0; i < this._ingredients.length; i++){
            sum += this._ingredients[i].cost();
        }
        return sum;
    }

    getTotalCost(){
        return (this.getIngredientCost() + this.taxes + this.fees);
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Order;
},{}],4:[function(require,module,exports){
class RecipeIngredient{
    constructor(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        this._ingredient = ingredient;
        this._quantity = quantity;
    }

    get ingredient(){
        return this._ingredient;
    }

    get quantity(){
        if(this._ingredient.specialUnit === "bottle"){
            return this._quantity / this._ingredient.unitSize;
        }

        switch(this._ingredient.unit){
            case "g":return this._quantity;
            case "kg": return this._quantity / 1000;
            case "oz": return this._quantity / 28.3495;
            case "lb": return this._quantity / 453.5924;
            case "ml": return this._quantity * 1000;
            case "l": return this._quantity;
            case "tsp": return this._quantity * 202.8842;
            case "tbsp": return this._quantity * 67.6278;
            case "ozfl": return this._quantity * 33.8141;
            case "cup": return this._quantity * 4.1667;
            case "pt": return this._quantity * 2.1134;
            case "qt": return this._quantity * 1.0567;
            case "gal": return this._quantity / 3.7854;
            case "mm": return this._quantity * 1000;
            case "cm": return this._quantity * 100;
            case "m": return this._quantity;
            case "in": return this._quantity * 39.3701;
            case "ft": return this._quantity * 3.2808;
            default: return this._quantity;
        }
    }

    set quantity(quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }

        this_quantity = this.convertToBase(quantity);
    }

    getQuantityDisplay(){
        if(this._ingredient.specialUnit === "bottle"){
            
            return `${this.quantity.toFixed(2)} BOTTLES`;
        }

        return `${this.quantity.toFixed(2)} ${this._ingredient.unit.toUpperCase()}`;
    }

    convertToBase(quantity){
        switch(this._ingredient.unit){
            case "g": return quantity;
            case "kg": return quantity * 1000; 
            case "oz":  return quantity * 28.3495; 
            case "lb":  return quantity * 453.5924;
            case "ml": return quantity / 1000; 
            case "l": return quantity;
            case "tsp": return quantity / 202.8842; 
            case "tbsp": return quantity / 67.6278; 
            case "ozfl": return quantity / 33.8141; 
            case "cup": return quantity / 4.1667; 
            case "pt": return quantity / 2.1134; 
            case "qt": return quantity / 1.0567; 
            case "gal": return quantity * 3.7854;
            case "mm": return quantity / 1000; 
            case "cm": return quantity / 100; 
            case "m": return quantity;
            case "in": return quantity / 39.3701; 
            case "ft": return quantity / 3.2808;
            default: return quantity;
        }
    }
}

/*
Recipe Object
id = database id of recipe
name = name of recipe
price = price of recipe in cents
ingredients = [{
    ingredient: Ingredient Object,
    quantity: quantity of the ingredient within the recipe (stored as base unit, i.e grams)
}]
parent = merchant that it belongs to
*/
class Recipe{
    constructor(id, name, price, ingredients, parent){
        if(price < 0){
            banner.createError("PRICE CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        if(!this.isSanitaryString(name)){
            banner.createError("NAME CONTAINS ILLEGAL CHARACTERS");
            return false;
        }
        this._id = id;
        this._name = name;
        this._price = price;
        this._parent = parent;
        this._ingredients = [];

        for(let i = 0; i < ingredients.length; i++){
            const recipeIngredient = new RecipeIngredient(
                ingredients[i].ingredient,
                ingredients[i].quantity
            );

            this._ingredients.push(recipeIngredient);
        }
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(!this.isSanitaryString(name)){
            return false;
        }

        this._name = name;
    }

    get price(){
        return this._price / 100;
    }

    set price(price){
        if(price < 0){
            return false;
        }

        this._price = price;
    }

    get parent(){
        return this._parent;
    }

    get ingredients(){
        return this._ingredients;
    }

    addIngredient(ingredient, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }

        let recipeIngredient = new RecipeIngredient(ingredient, quantity);
        this._ingredients.push(recipeIngredient);

        this._parent.modules.recipeBook.isPopulated = false;
        this._parent.modules.analytics.isPopulated = false;
    }

    removeIngredients(){
        this._ingredients = [];
    }

    isSanitaryString(str){
        let disallowed = ["\\", "<", ">", "$", "{", "}", "(", ")"];

        for(let i = 0; i < disallowed.length; i++){
            if(str.includes(disallowed[i])){
                return false;
            }
        }

        return true;
    }
}

module.exports = Recipe;
},{}],5:[function(require,module,exports){
class TransactionRecipe{
    constructor(recipe, quantity){
        if(quantity < 0){
            banner.createError("QUANTITY CANNOT BE A NEGATIVE NUMBER");
            return false;
        }
        if(quantity % 1 !== 0){
            banner.createError("RECIPES WITHIN A TRANSACTION MUST BE WHOLE NUMBERS");
            return false;
        }
        this._recipe = recipe;
        this._quantity = quantity;
    }

    get recipe(){
        return this._recipe;
    }

    get quantity(){
        return this._quantity;
    }
}

class Transaction{
    constructor(id, date, recipes, parent){
        date = new Date(date);
        if(date > new Date()){
            banner.createError("DATE CANNOT BE SET TO THE FUTURE");
            return false;
        }
        this._id = id;
        this._parent = parent;
        this._date = date;
        this._recipes = [];

        for(let i = 0; i < recipes.length; i++){
            for(let j = 0; j < parent.recipes.length; j++){
                if(recipes[i].recipe === parent.recipes[j].id){
                    const transactionRecipe = new TransactionRecipe(
                        parent.recipes[j],
                        recipes[i].quantity
                    )
        
                    this._recipes.push(transactionRecipe);

                    break;
                }
            }
        }
    }

    get id(){
        return this._id;
    }

    get parent(){
        return this._parent;
    }

    get date(){
        return this._date;
    }

    get recipes(){
        return this._recipes;
    }
}

module.exports = Transaction;
},{}],6:[function(require,module,exports){
const home = require("./strands/home.js");
const ingredients = require("./strands/ingredients.js");
const recipeBook = require("./strands/recipeBook.js");
const analytics = require("./strands/analytics.js");
const orders = require("./strands/orders.js");
const transactions = require("./strands/transactions.js");

const ingredientDetails = require("./sidebars/ingredientDetails.js");
const newIngredient = require("./sidebars/newIngredient.js");
const editIngredient = require("./sidebars/editIngredient.js");
const newOrder = require("./sidebars/newOrder.js");
const newRecipe = require("./sidebars/newRecipe.js");
const editRecipe = require("./sidebars/editRecipe.js");
const newTransaction = require("./sidebars/newTransaction.js");
const orderDetails = require("./sidebars/orderDetails.js");
const orderFilter = require("./sidebars/orderFilter.js");
const recipeDetails = require("./sidebars/recipeDetails.js");
const transactionDetails = require("./sidebars/transactionDetails.js");
const transactionFilter = require("./sidebars/transactionFilter.js");

const Merchant = require("./classes/Merchant.js");
const Ingredient = require("./classes/Ingredient.js");
const Recipe = require("./classes/Recipe.js");
const Order = require("./classes/Order.js");
const Transaction = require("./classes/Transaction.js");

merchant = new Merchant(data.merchant, data.transactions, {
    home: home,
    ingredients: ingredients,
    transactions: transactions,
    recipeBook: recipeBook,
    analytics: analytics,
    orders: orders,
    Ingredient: Ingredient,
    Recipe: Recipe,
    Transaction: Transaction
});

controller = {
    openStrand: function(strand, data = undefined){
        this.closeSidebar();

        let strands = document.querySelectorAll(".strand");
        for(let i = 0; i < strands.length; i++){
            strands[i].style.display = "none";
        }

        let buttons = document.querySelectorAll(".menuButton");
        for(let i = 0; i < buttons.length - 1; i++){
            buttons[i].classList = "menuButton";
            buttons[i].disabled = false;
        }

        let activeButton = {};
        switch(strand){
            case "home": 
                activeButton = document.getElementById("homeBtn");
                document.getElementById("homeStrand").style.display = "flex";
                home.display();
                break;
            case "ingredients": 
                activeButton = document.getElementById("ingredientsBtn");
                document.getElementById("ingredientsStrand").style.display = "flex";
                ingredients.display();
                break;
            case "recipeBook":
                activeButton = document.getElementById("recipeBookBtn");
                document.getElementById("recipeBookStrand").style.display = "flex";
                recipeBook.display(Recipe);
                break;
            case "analytics":
                activeButton = document.getElementById("analyticsBtn");
                document.getElementById("analyticsStrand").style.display = "flex";
                analytics.display(Transaction);
                break;
            case "orders":
                activeButton = document.getElementById("ordersBtn");
                document.getElementById("ordersStrand").style.display = "flex";
                orders.orders = data;
                orders.display(Order);
                break;
            case "transactions":
                activeButton = document.getElementById("transactionsBtn");
                document.getElementById("transactionsStrand").style.display = "flex";
                transactions.transactions = data;
                transactions.display(Transaction);
                break;
        }

        activeButton.classList = "menuButton active";
        activeButton.disabled = true;

        if(window.screen.availWidth <= 1000){
            this.closeMenu();
        }
    },

    /*
    Open a specific sidebar
    Input:
    sidebar: the outermost element of the sidebar (must contain class sidebar)
    */
    openSidebar: function(sidebar, data = {}){
        this.closeSidebar();

        document.getElementById("sidebarDiv").classList = "sidebar";
        document.getElementById(sidebar).style.display = "flex";

        switch(sidebar){
            case "ingredientDetails":
                ingredientDetails.display(data, ingredients);
                break;
            case "newIngredient":
                newIngredient.display(Ingredient);
                break;
            case "editIngredient":
                editIngredient.display(data);
                break;
            case "recipeDetails":
                recipeDetails.display(data);
                break;
            case "editRecipe":
                editRecipe.display(data);
                break;
            case "addRecipe":
                newRecipe.display(Recipe);
                break;
            case "orderDetails":
                orderDetails.display(data);
                break;
            case "orderFilter":
                orderFilter.display(Order);
                break;
            case "newOrder":
                newOrder.display(Order);
                break;
            case "transactionDetails":
                transactionDetails.display(data);
                break;
            case "transactionFilter":
                transactionFilter.display();
                break;
            case "newTransaction":
                newTransaction.display(Transaction);
                break;
        }

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "none";
            document.getElementById("mobileMenuSelector").style.display = "none";
            document.getElementById("sidebarCloser").style.display = "block";
        }
    },

    closeSidebar: function(){
        let sidebar = document.getElementById("sidebarDiv");
        for(let i = 0; i < sidebar.children.length; i++){
            if(sidebar.children[i].style.display !== "none"){
                sidebar.children[i].style.display = "none";
                let choosables = [];

                switch(sidebar.children[i].id){
                    case "ingredientDetails": 
                        choosables = document.querySelectorAll(".ingredient");
                        break;
                    case "transactionDetails":
                        choosables = document.getElementById("transactionsList").children;
                        break;
                    case "recipeDetails":
                        choosables = document.getElementById("recipeList").children;
                        break;
                    case "orderDetails":
                        choosables = document.getElementById("orderList").children;
                        break;
                }

                for(let i = 0; i < choosables.length; i++){
                    choosables[i].classList.remove("active");
                }
            }

            
        }
        sidebar.classList = "sidebarHide";

        if(window.screen.availWidth <= 1000){
            document.querySelector(".contentBlock").style.display = "flex";
            document.getElementById("mobileMenuSelector").style.display = "block";
            document.getElementById("sidebarCloser").style.display = "none";
        }
    },

    changeMenu: function(){
        let menu = document.querySelector(".menu");
        let buttons = document.querySelectorAll(".menuButton");
        if(!menu.classList.contains("menuMinimized")){
            menu.classList = "menu menuMinimized";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "none";
            }

            document.getElementById("max").style.display = "none";
            document.getElementById("min").style.display = "flex";

            
        }else if(menu.classList.contains("menuMinimized")){
            menu.classList = "menu";

            for(let i = 0; i < buttons.length; i++){
                buttons[i].children[1].style.display = "block";
            }

            setTimeout(()=>{
                document.getElementById("max").style.display = "flex";
                document.getElementById("min").style.display = "none";
            }, 150);
        }
    },

    openMenu: function(){
        document.getElementById("menu").style.display = "flex";
        document.querySelector(".contentBlock").style.display = "none";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.closeMenu()};
    },

    closeMenu: function(){
        document.getElementById("menu").style.display = "none";
        document.querySelector(".contentBlock").style.display = "flex";
        document.getElementById("mobileMenuSelector").onclick = ()=>{this.openMenu()};
    },

    /*
    Converts the price of unit back to the price per default unit
    unitType = type of the unit (i.e. mass, volume)
    unit = exact unit to convert to
    price = price of the ingredient per unit in cents
    */
    reconvertPrice(unitType, unit, price){
        if(unitType === "mass"){
            switch(unit){
                case "g": break;
                case "kg": price *= 1000; break;
                case "oz":  price *= 28.3495; break;
                case "lb":  price *= 453.5924; break;
            }
        }else if(unitType === "volume"){
            switch(unit){
                case "ml": price /= 1000; break;
                case "l": break;
                case "tsp": price /= 202.8842; break;
                case "tbsp": price /= 67.6278; break;
                case "ozfl": price /= 33.8141; break;
                case "cup": price /= 4.1667; break;
                case "pt": price /= 2.1134; break;
                case "qt": price /= 1.0567; break;
                case "gal": price *= 3.7854; break;
            }
        }else if(unitType === "length"){
            switch(unit){
                case "mm": price /= 1000; break;
                case "cm": price /= 100; break;
                case "m": break;
                case "in": price /= 39.3701; break;
                case "ft": price /= 3.2808; break;
            }
        }

        return price;
    }
}

if(window.screen.availWidth > 1000 && window.screen.availWidth <= 1400){
    this.changeMenu();
    document.getElementById("menuShifter2").style.display = "none";
}
//Add click listeners for menu buttons
document.getElementById("homeBtn").onclick = ()=>{controller.openStrand("home")};
document.getElementById("ingredientsBtn").onclick = ()=>{controller.openStrand("ingredients")};
document.getElementById("recipeBookBtn").onclick = ()=>{controller.openStrand("recipeBook")};
document.getElementById("analyticsBtn").onclick = ()=>{controller.openStrand("analytics")};
document.getElementById("ordersBtn").onclick = async ()=>{
    if(merchant.orders.length === 0){
        merchant.setOrders(await orders.getOrders(Order));
    }
    controller.openStrand("orders", merchant.orders);
}
document.getElementById("transactionsBtn").onclick = ()=>{controller.openStrand("transactions", merchant.getTransactions())};

controller.openStrand("home");
},{"./classes/Ingredient.js":1,"./classes/Merchant.js":2,"./classes/Order.js":3,"./classes/Recipe.js":4,"./classes/Transaction.js":5,"./sidebars/editIngredient.js":7,"./sidebars/editRecipe.js":8,"./sidebars/ingredientDetails.js":9,"./sidebars/newIngredient.js":10,"./sidebars/newOrder.js":11,"./sidebars/newRecipe.js":12,"./sidebars/newTransaction.js":13,"./sidebars/orderDetails.js":14,"./sidebars/orderFilter.js":15,"./sidebars/recipeDetails.js":16,"./sidebars/transactionDetails.js":17,"./sidebars/transactionFilter.js":18,"./strands/analytics.js":19,"./strands/home.js":20,"./strands/ingredients.js":21,"./strands/orders.js":22,"./strands/recipeBook.js":23,"./strands/transactions.js":24}],7:[function(require,module,exports){
let editIngredient = {
    display: function(ingredient){
        let buttonList = document.getElementById("unitButtons");
        let quantLabel = document.getElementById("editIngQuantityLabel");
        let specialLabel = document.getElementById("editSpecialLabel");

        //Clear any existing data
        while(buttonList.children.length > 0){
            buttonList.removeChild(buttonList.firstChild);
        }

        //Populate basic fields
        document.getElementById("editIngTitle").innerText = ingredient.ingredient.name;
        document.getElementById("editIngName").value = ingredient.ingredient.name;
        document.getElementById("editIngCategory").value = ingredient.ingredient.category;
        quantLabel.innerText = `CURRENT STOCK (${ingredient.ingredient.unit.toUpperCase()})`;
        document.getElementById("editIngSubmit").onclick = ()=>{this.submit(ingredient)};

        //Populate the unit buttons
        const units = merchant.units[ingredient.ingredient.unitType];

        for(let i = 0; i < units.length; i++){
            let button = document.createElement("button");
            button.classList.add("unitButton");
            button.innerText = units[i].toUpperCase();
            button.onclick = ()=>{this.changeUnit(button)};
            buttonList.appendChild(button);

            if(units[i] === ingredient.ingredient.unit){
                button.classList.add("unitActive");
            }
        }
        
        //Make any changes for special ingredients
        if(ingredient.ingredient.specialUnit === "bottle"){
            quantLabel.innerText = "CURRENT STOCK (BOTTLES):";

            specialLabel.style.display = "flex";
            specialLabel.innerText = `BOTTLE SIZE (${ingredient.ingredient.unit.toUpperCase()}):`;
            
            let sizeInput = document.createElement("input");
            sizeInput.id = "editIngSpecialSize";
            sizeInput.type = "number";
            sizeInput.min = "0";
            sizeInput.step = "0.01";
            sizeInput.value = ingredient.ingredient.unitSize.toFixed(2);
            specialLabel.appendChild(sizeInput);
        }else{
            specialLabel.style.display = "none";
        }

        let quantInput = document.createElement("input");
        quantInput.id = "editIngQuantity";
        quantInput.type = "number";
        quantInput.min = "0";
        quantInput.step = "0.01";
        quantInput.value = ingredient.quantity.toFixed(2);
        quantLabel.appendChild(quantInput);
    },

    changeUnit(button){
        let buttons = document.getElementById("unitButtons");

        for(let i = 0; i < buttons.children.length; i++){
            buttons.children[i].classList.remove("unitActive");
        }

        button.classList.add("unitActive");
    },

    submit(ingredient){
        const quantity = parseFloat(document.getElementById("editIngQuantityLabel").children[0].value);

        let data = {
            id: ingredient.ingredient.id,
            name: document.getElementById("editIngName").value,
            category: document.getElementById("editIngCategory").value
        }

        //Add data based on unit type
        if(ingredient.ingredient.specialUnit === "bottle"){
            let unitSize = ingredient.convertToBase(parseFloat(document.getElementById("editSpecialLabel").children[0].value));
            data.quantity = quantity * unitSize;
            data.unitSize = unitSize;
        }else{
            data.quantity = ingredient.convertToBase(quantity);
        }

        //Get the measurement unit
        let units = document.getElementById("unitButtons");
        for(let i = 0; i < units.children.length; i++){
            if(units.children[i].classList.contains("unitActive")){
                data.unit = units.children[i].innerText.toLowerCase();
                break;
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            if(typeof(response) === "string"){
                banner.createError(response);
            }else{
                ingredient.ingredient.name = response.ingredient.name;
                ingredient.ingredient.category = response.ingredient.category;
                ingredient.ingredient.unitSize = response.ingredient.unitSize;
                ingredient.ingredient.unit = response.unit;

                merchant.updateIngredient(ingredient, response.quantity);
                controller.openStrand("ingredients");
                banner.createNotification("INGREDIENT UPDATED");
            }
        })
        .catch((err)=>{
            banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = editIngredient;
},{}],8:[function(require,module,exports){
let editRecipe = {
    display: function(recipe){
        let nameInput = document.getElementById("editRecipeName");
        if(merchant.pos === "none"){
            nameInput.value = recipe.name;
        }else{
            document.getElementById("editRecipeNoName").innertext = recipe.name;
            nameInput.parentNode.style.display = "none";
        }

        //Populate ingredients
        let ingredientList = document.getElementById("editRecipeIngList");

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("editRecipeIng").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
            ingredientDiv.children[1].innerText = recipe.ingredients[i].ingredient.getNameAndUnit();
            ingredientDiv.children[2].style.display = "none";
            ingredientDiv.children[3].value = recipe.ingredients[i].quantity;
            ingredientDiv.ingredient = recipe.ingredients[i];
            
            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("addRecIng").onclick = ()=>{this.newIngredient()};
        document.getElementById("editRecipePrice").value = recipe.price;
        document.getElementById("editRecipeSubmit").onclick = ()=>{this.submit(recipe)};
        document.getElementById("editRecipeCancel").onclick = ()=>{controller.openSidebar("recipeDetails", recipe)};
    },

    newIngredient: function(){
        let ingredientList = document.getElementById("editRecipeIngList");

        let ingredientDiv = document.getElementById("editRecipeIng").content.children[0].cloneNode(true);
        ingredientDiv.children[0].onclick = ()=>{ingredientDiv.parentNode.removeChild(ingredientDiv)};
        ingredientDiv.children[1].style.display = "none";
        ingredientDiv.children[3].value = "0.00";

        //Populate selector
        let categories = merchant.categorizeIngredients();
        for(let i = 0; i < categories.length; i++){
            let group = document.createElement("optgroup");
            group.label = categories[i].name;

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let option = document.createElement("option");
                option.innerText = categories[i].ingredients[j].ingredient.getNameAndUnit();
                option.ingredient = categories[i].ingredients[j];
                group.appendChild(option);
            }
            
            ingredientDiv.children[2].appendChild(group);
        }

        ingredientList.appendChild(ingredientDiv);
    },

    submit: function(recipe){
        let data = {
            id: recipe.id,
            name: recipe.name,
            price: document.getElementById("editRecipePrice").value * 100,
            ingredients: []
        }

        if(merchant.pos === "none"){
            data.name = document.getElementById("editRecipeName").value;
        }

        let ingredients = document.getElementById("editRecipeIngList").children;
        for(let i = 0; i < ingredients.length; i++){
            const quantity = parseFloat(ingredients[i].children[3].value);

            if(ingredients[i].children[1].style.display === "none"){
                let selector = ingredients[i].children[2];
                let ingredient = selector.options[selector.selectedIndex].ingredient;

                data.ingredients.push({
                    ingredient: ingredient.ingredient.id,
                    quantity: ingredient.convertToBase(quantity)
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity)
                });
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/update", {
            method: "put",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.updateRecipe(response);
                    controller.openStrand("recipeBook");
                    banner.createNotification("RECIPE UPDATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = editRecipe;
},{}],9:[function(require,module,exports){
let ingredientDetails = {
    dailyUse: 0,

    display: function(ingredient){
        document.getElementById("editIngBtn").onclick = ()=>{controller.openSidebar("editIngredient", ingredient)};
        document.getElementById("removeIngBtn").onclick = ()=>{this.remove(ingredient)};
        document.getElementById("ingredientDetailsCategory").innerText = ingredient.ingredient.category;
        document.getElementById("ingredientDetailsName").innerText = ingredient.ingredient.name;
        document.getElementById("ingredientStock").innerText = ingredient.getQuantityDisplay();


        //Calculate and display average daily use
        let quantities = [];
        let now = new Date();
        for(let i = 1; i < 31; i++){
            let endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            let startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i - 1);

            quantities.push(merchant.getSingleIngredientSold(ingredient, startDay, endDay));
        }

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        let dailyUse = sum / quantities.length;
        const dailyUseDiv = document.getElementById("dailyUse");
        if(ingredient.ingredient.specialUnit === "bottle"){
            dailyUseDiv.innerText = `${dailyUse.toFixed(2)} BOTTLES`;
        }else{
            dailyUseDiv.innerText = `${dailyUse.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
        }

        //Show recipes that this ingredient is a part of
        let recipeList = document.getElementById("ingredientRecipeList");
        let template = document.getElementById("ingredientRecipe").content.children[0];
        let recipes = merchant.getRecipesForIngredient(ingredient.ingredient);

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipes[i].name;
            recipeDiv.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", recipes[i]);
            }
            recipeDiv.classList.add("choosable");
            recipeList.appendChild(recipeDiv);
        }
    },

    remove: function(ingredient){
        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(ingredient.ingredient === merchant.recipes[i].ingredients[j].ingredient){
                    banner.createError("MUST REMOVE INGREDIENT FROM ALL RECIPES BEFORE REMOVING FROM INVENTORY");
                    return;
                }
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/ingredients/remove/${ingredient.ingredient.id}`, {
            method: "delete",
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeIngredient(ingredient);
                    
                    controller.openStrand("ingredients");
                    banner.createNotification("INGREDIENT REMOVED");
                }
            })
            .catch((err)=>{})
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = ingredientDetails;
},{}],10:[function(require,module,exports){
let newIngredient = {
    display: function(Ingredient){
        const selector = document.getElementById("unitSelector");

        document.getElementById("newIngName").value = "";
        document.getElementById("newIngCategory").value = "";
        document.getElementById("newIngQuantity").value = 0;
        document.getElementById("bottleSizeLabel").style.display = "none";
        selector.value = "g";

        selector.onchange = ()=>{this.unitChange()};
        document.getElementById("submitNewIng").onclick = ()=>{this.submit(Ingredient)};
    },

    unitChange: function(){
        const select = document.getElementById("unitSelector");
        const bottleLabel = document.getElementById("bottleSizeLabel");
        if(select.value === "bottle"){
            bottleLabel.style.display = "block";
        }else{
            bottleLabel.style.display = "none";
        }
    },

    submit: function(Ingredient){
        let unitSelector = document.getElementById("unitSelector");
        let options = document.querySelectorAll("#unitSelector option");
        const quantityValue = parseFloat(document.getElementById("newIngQuantity").value);

        let unit = unitSelector.value;

        let newIngredient = {
            ingredient: {
                name: document.getElementById("newIngName").value,
                category: document.getElementById("newIngCategory").value,
                unitType: options[unitSelector.selectedIndex].getAttribute("type")
            },
            quantity: quantityValue,
            defaultUnit: unit
        }

        //Change the ingredient if it is a special unit type (ie "bottle")
        if(unit === "bottle"){
            newIngredient.ingredient.unitType = "volume";
            newIngredient.ingredient.unitSize = document.getElementById("bottleSize").value;
            newIngredient.defaultUnit = document.getElementById("bottleUnits").value;
            newIngredient.ingredient.specialUnit = unit;
            newIngredient.quantity = quantityValue;
        }
    
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/ingredients/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newIngredient)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    const ingredient = new Ingredient(
                        response.ingredient._id,
                        response.ingredient.name,
                        response.ingredient.category,
                        response.ingredient.unitType,
                        response.defaultUnit,
                        merchant,
                        response.ingredient.specialUnit,
                        response.ingredient.unitSize
                    )

                    merchant.addIngredient(ingredient, response.quantity);
                    controller.openStrand("ingredients");

                    banner.createNotification("INGREDIENT CREATED");
                }
            })
            .catch((err)=>{
                console.log(err);
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },


}

module.exports = newIngredient;
},{}],11:[function(require,module,exports){
let newOrder = {
    display: function(Order){
        document.getElementById("sidebarDiv").classList.add("sidebarWide");
        document.getElementById("newOrderIngredientList").style.display = "flex";

        let selectedList = document.getElementById("selectedIngredientList");
        while(selectedList.children.length > 0){
            selectedList.removeChild(selectedList.firstChild);
        }

        let ingredientList = document.getElementById("newOrderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let ingredient = document.createElement("button");
            ingredient.classList = "choosable";
            ingredient.innerText = merchant.ingredients[i].ingredient.name;
            ingredient.onclick = ()=>{this.addIngredient(merchant.ingredients[i], ingredient)};
            ingredientList.appendChild(ingredient);
        }

        document.getElementById("submitNewOrder").onclick = ()=>{this.submit(Order)};
    },

    addIngredient: function(ingredient, element){
        element.style.display = "none";

        let div = document.getElementById("selectedIngredient").content.children[0].cloneNode(true);
        div.ingredient = ingredient;
        div.children[0].children[1].onclick = ()=>{this.removeIngredient(div, element)};

        //Display units depending on the whether it is a special unit
        if(ingredient.ingredient.specialUnit === "bottle"){
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (BOTTLES)`;
        }else{
            div.children[0].children[0].innerText = `${ingredient.ingredient.name} (${ingredient.ingredient.unit.toUpperCase()})`;
        }

        document.getElementById("selectedIngredientList").appendChild(div);
    },

    removeIngredient: function(selectedElement, element){
        selectedElement.parentElement.removeChild(selectedElement);
        element.style.display = "block";
    },

    submit: function(Order){
        let date = document.getElementById("newOrderDate").value;
        let taxes = document.getElementById("orderTaxes").value * 100;
        let fees = document.getElementById("orderFees").value * 100;
        let ingredients = document.getElementById("selectedIngredientList").children;

        if(date === ""){
            banner.createError("DATE IS REQUIRED FOR ORDERS");
            return;
        }

        let data = {
            name: document.getElementById("newOrderName").value,
            date: date,
            taxes: taxes,
            fees: fees,
            ingredients: []
        }

        for(let i = 0; i < ingredients.length; i++){
            let quantity = ingredients[i].children[1].children[0].value;
            let price = ingredients[i].children[1].children[1].value;

            if(quantity === "" || price === ""){
                banner.createError("MUST PROVIDE QUANTITY AND PRICE PER UNIT FOR ALL INGREDIENTS");
                return;
            }

            if(quantity < 0 || price < 0){
                banner.createError("QUANTITY AND PRICE MUST BE NON-NEGATIVE NUMBERS");
            }

            if(ingredients[i].ingredient.ingredient.specialUnit === "bottle"){
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: quantity * ingredients[i].ingredient.ingredient.unitSize,
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
                });
            }else{
                data.ingredients.push({
                    ingredient: ingredients[i].ingredient.ingredient.id,
                    quantity: ingredients[i].ingredient.convertToBase(quantity),
                    pricePerUnit: this.convertPrice(ingredients[i].ingredient.ingredient, price * 100)
                });
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order/create", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then((response)=>response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let order = new Order(
                        response._id,
                        response.name,
                        response.date,
                        response.taxes,
                        response.fees,
                        response.ingredients,
                        merchant
                    );

                    merchant.addOrder(order, true);
                    
                    controller.openStrand("orders", merchant.orders);
                    banner.createNotification("NEW ORDER CREATED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG, PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },

    convertPrice: function(ingredient, price){
        if(ingredient.specialUnit === "bottle"){
            return price / ingredient.unitSize;
        }

        switch(ingredient.unit){
            case "g": return price;
            case "kg": return price / 1000; 
            case "oz": return price / 28.3495; 
            case "lb": return price / 453.5924; 
            case "ml": return price * 1000; 
            case "l": return price;
            case "tsp": return price * 202.8842; 
            case "tbsp": return price * 67.6278; 
            case "ozfl": return price * 33.8141; 
            case "cup": return price * 4.1667; 
            case "pt": return price * 2.1134; 
            case "qt": return price * 1.0567; 
            case "gal": return price / 3.7854; 
            case "mm": return price * 1000; 
            case "cm": return price * 100; 
            case "m": return price;
            case "in": return price * 39.3701; 
            case "ft": return price * 3.2808; 
        }
    }
}

module.exports = newOrder;
},{}],12:[function(require,module,exports){
let newRecipe = {
    display: function(Recipe){
        document.getElementById("newRecipeName").value = "";
        document.getElementById("newRecipePrice").value = "";
        document.getElementById("ingredientCount").value = 1;

        let categories = merchant.categorizeIngredients();

        let ingredientsSelect = document.getElementById("recipeInputIngredients");
        while(ingredientsSelect.children.length > 0){
            ingredientsSelect.removeChild(ingredientsSelect.firstChild);
        }

        this.changeIngredientCount(categories);

        document.getElementById("ingredientCount").onchange = ()=>{this.changeIngredientCount(categories)};
        document.getElementById("submitNewRecipe").onclick = ()=>{this.submit(Recipe)};
    },

    //Updates the number of ingredient inputs displayed for new recipes
    changeIngredientCount: function(categories){
        let newCount = document.getElementById("ingredientCount").value;
        let ingredientsDiv = document.getElementById("recipeInputIngredients");
        let template = document.getElementById("recipeInputIngredient").content.children[0];
        let oldCount = ingredientsDiv.children.length;

        if(newCount > oldCount){
            let newDivs = newCount - oldCount;

            for(let i = 0; i < newDivs; i++){
                let newNode = template.cloneNode(true);
                newNode.children[0].innnerText = `INGREDIENT ${i + oldCount}`;
                newNode.children[2].children[0].value = 0;

                for(let j = 0; j < categories.length; j++){
                    let optgroup = document.createElement("optgroup");
                    optgroup.label = categories[j].name;

                    for(let k = 0; k < categories[j].ingredients.length; k++){
                        let option = document.createElement("option");
                        option.innerText = categories[j].ingredients[k].ingredient.getNameAndUnit();
                        option.ingredient = categories[j].ingredients[k];
                        optgroup.appendChild(option);
                    }

                    newNode.children[1].children[0].appendChild(optgroup);
                }

                ingredientsDiv.appendChild(newNode);
            }

            for(let i = 0; i < newCount; i++){
                ingredientsDiv.children[i].children[0].innerText = `INGREDIENT ${i + 1}`;
            }
        }else if(newCount < oldCount){
            let newDivs = oldCount - newCount;

            for(let i = 0; i < newDivs; i++){
                ingredientsDiv.removeChild(ingredientsDiv.children[ingredientsDiv.children.length-1]);
            }
        }
    },

    submit: function(Recipe){
        let newRecipe = {
            name: document.getElementById("newRecipeName").value,
            price: document.getElementById("newRecipePrice").value,
            ingredients: []
        }

        let inputs = document.getElementById("recipeInputIngredients").children;
        for(let i = 0; i < inputs.length; i++){
            let sel = inputs[i].children[1].children[0];
            let ingredient = sel.options[sel.selectedIndex].ingredient;

            newRecipe.ingredients.push({
                ingredient: ingredient.ingredient.id,
                quantity: ingredient.convertToBase(inputs[i].children[2].children[0].value)
            });
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/recipe/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newRecipe)
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    let ingredients = [];
                    for(let i = 0; i < response.ingredients.length; i++){
                        for(let j = 0; j < merchant.ingredients.length; j++){
                            if(merchant.ingredients[j].ingredient.id === response.ingredients[i].ingredient){
                                ingredients.push({
                                    ingredient: merchant.ingredients[j].ingredient,
                                    quantity: response.ingredients[i].quantity
                                });

                                break;
                            }
                        }
                    }

                    merchant.addRecipe(new Recipe(
                        response._id,
                        response.name,
                        response.price,
                        ingredients,
                        merchant
                    ));

                    banner.createNotification("RECIPE CREATED");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = newRecipe;
},{}],13:[function(require,module,exports){
let newTransaction = {
    display: function(Transaction){
        let recipeList = document.getElementById("newTransactionRecipes");
        let template = document.getElementById("createTransaction").content.children[0];

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.recipe = merchant.recipes[i];
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
        }

        document.getElementById("submitNewTransaction").onclick = ()=>{this.submit(Transaction)};
    },

    submit: function(Transaction){
        let recipeDivs = document.getElementById("newTransactionRecipes");
        let date = document.getElementById("newTransactionDate").valueAsDate;
        
        if(date > new Date()){
            banner.createError("CANNOT HAVE A DATE IN THE FUTURE");
            return;
        }
        
        let data = {
            date: date,
            recipes: [],
            ingredientUpdates: {}
        };

        for(let i = 0; i < recipeDivs.children.length;  i++){
            let quantity = recipeDivs.children[i].children[1].value;
            const recipe = recipeDivs.children[i].recipe;
            if(quantity !== "" && quantity > 0){
                data.recipes.push({
                    recipe: recipe.id,
                    quantity: quantity
                });

                for(let j = 0; j < recipe.ingredients.length; j++){
                    let ingredient = recipe.ingredients[j];
                    if(data.ingredientUpdates[ingredient.ingredient.id]){
                        data.ingredientUpdates[ingredient.ingredient.id] += ingredient.convertToBase(ingredient.quantity) * quantity;
                    }else{
                        data.ingredientUpdates[ingredient.ingredient.id] = ingredient.convertToBase(ingredient.quantity) * quantity;
                    }
                }
            }else if(quantity < 0){
                banner.createError("CANNOT HAVE NEGATIVE VALUES");
                return;
            }
        }

        if(data.recipes.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/transaction/create", {
                method: "post",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        const transaction = new Transaction(
                            response._id,
                            response.date,
                            response.recipes,
                            merchant
                        );

                        merchant.addTransaction(transaction);

                        controller.openStrand("transactions", merchant.getTransactions());
                        banner.createNotification("TRANSACTION CREATED");
                    }
                })
                .catch((err)=>{
                    banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
                })
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = newTransaction;
},{}],14:[function(require,module,exports){
let orderDetails = {
    display: function(order){
        document.getElementById("removeOrderBtn").onclick = ()=>{this.remove(order)};

        document.getElementById("orderDetailName").innerText = order.name;
        document.getElementById("orderDetailDate").innerText = order.date.toLocaleDateString("en-US");
        document.getElementById("orderDetailTax").innerText = `$${order.taxes.toFixed(2)}`;
        document.getElementById("orderDetailFee").innerText = `$${order.fees.toFixed(2)}`;

        let ingredientList = document.getElementById("orderIngredients");
        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        let template = document.getElementById("orderIngredient").content.children[0];
        for(let i = 0; i < order.ingredients.length; i++){
            let ingredientDiv = template.cloneNode(true);
            const ingredient = order.ingredients[i].ingredient;
            
            ingredientDiv.children[0].innerText = order.ingredients[i].ingredient.name;
            ingredientDiv.children[2].innerText = `$${order.ingredients[i].cost().toFixed(2)}`;
            ingredientDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(order.ingredients[i].ingredient.id));
            }
            
            let ingredientDisplay = ingredientDiv.children[1];
            if(ingredient.specialUnit === "bottle"){
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} bottles x $${order.ingredients.pricePerUnit.toFixed(2)}`;
            }else{
                ingredientDisplay.innerText = `${order.ingredients[i].quantity.toFixed(2)} ${ingredient.unit.toUpperCase()} X $${order.ingredients[i].pricePerUnit.toFixed(2)}`;
            }

            ingredientList.appendChild(ingredientDiv);
        }

        document.getElementById("orderDetailTotal").innerText = `$${order.getIngredientCost().toFixed(2)}`;
        document.querySelector("#orderTotalPrice p").innerText = `$${order.getTotalCost().toFixed(2)}`;
    },

    remove: function(order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/order/${order.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeOrder(order);

                    controller.openStrand("orders", merchant.orders);
                    banner.createNotification("ORDER REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = orderDetails;
},{}],15:[function(require,module,exports){
let orderFilter = {
    display: function(Order){
        let now = new Date();
        let past = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        let ingredientList = document.getElementById("orderFilterIngredients");

        document.getElementById("orderFilterDateFrom").valueAsDate = past;
        document.getElementById("orderFilterDateTo").valueAsDate = now;

        while(ingredientList.children.length > 0){
            ingredientList.removeChild(ingredientList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let element = document.createElement("div");
            element.classList.add("choosable");
            element.ingredient = merchant.ingredients[i].ingredient.id;
            element.onclick = ()=>{this.toggleActive(element)};
            ingredientList.appendChild(element);

            let text = document.createElement("p");
            text.innerText = merchant.ingredients[i].ingredient.name;
            element.appendChild(text);
        }

        document.getElementById("orderFilterSubmit").onclick = ()=>{this.submit(Order)};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(Order){
        let data = {
            startDate: document.getElementById("orderFilterDateFrom").valueAsDate,
            endDate: document.getElementById("orderFilterDateTo").valueAsDate,
            ingredients: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let ingredients = document.getElementById("orderFilterIngredients").children;
        for(let i = 0; i < ingredients.length; i++){
            if(ingredients[i].classList.contains("active")){
                data.ingredients.push(ingredients[i].ingredient);
            }
        }

        if(data.ingredients.length === 0){
            for(let i = 0; i < merchant.ingredients.length; i++){
                data.ingredients.push(merchant.ingredients[i].ingredient.id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/order", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then((response)=>{
            let orders = [];
            if(typeof(response) === "string"){
                banner.createError(response);
            }else if(response.length === 0){
                banner.createError("NO ORDERS MATCH YOUR SEARCH");
            }else{
                for(let i = 0; i < response.length; i++){
                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    ));
                }
            }

            controller.openStrand("orders", orders);
        })
        .catch((err)=>{
            banner.createError("UNABLE TO DISPLAY THE ORDERS");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orderFilter;
},{}],16:[function(require,module,exports){
let recipeDetails = {
    display: function(recipe){
        document.getElementById("editRecipeBtn").onclick = ()=>{controller.openSidebar("editRecipe", recipe)};
        document.getElementById("recipeName").innerText = recipe.name;
        if(merchant.pos === "none"){
            document.getElementById("removeRecipeBtn").onclick = ()=>{this.remove(recipe)};
        }

        //ingredient list
        let ingredientsDiv = document.getElementById("recipeIngredientList");

        while(ingredientsDiv.children.length > 0){
            ingredientsDiv.removeChild(ingredientsDiv.firstChild);
        }

        let template = document.getElementById("recipeIngredient").content.children[0];
        for(let i = 0; i < recipe.ingredients.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.children[0].innerText = recipe.ingredients[i].ingredient.name;
            recipeDiv.children[1].innerText = `${recipe.ingredients[i].getQuantityDisplay()}`;
            recipeDiv.onclick = ()=>{
                controller.openStrand("ingredients");
                controller.openSidebar("ingredientDetails", merchant.getIngredient(recipe.ingredients[i].ingredient.id));
            }
            ingredientsDiv.appendChild(recipeDiv);
        }

        document.getElementById("recipePrice").children[1].innerText = `$${recipe.price.toFixed(2)}`;
    },

    remove: function(recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/recipe/remove/${recipe.id}`, {
            method: "delete"
        })
            .then((response) => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeRecipe(recipe);

                    banner.createNotification("RECIPE REMOVED");
                    controller.openStrand("recipeBook");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeDetails;
},{}],17:[function(require,module,exports){
let transactionDetails = {
    transaction: {},

    display: function(transaction){
        this.transaction = transaction;

        let recipeList = document.getElementById("transactionRecipes");
        let template = document.getElementById("transactionRecipe").content.children[0];
        let totalRecipes = 0;
        let totalPrice = 0;

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < transaction.recipes.length; i++){
            let recipe = template.cloneNode(true);
            let price = transaction.recipes[i].quantity * transaction.recipes[i].recipe.price;

            recipe.children[0].innerText = transaction.recipes[i].recipe.name;
            recipe.children[1].innerText = `${transaction.recipes[i].quantity} x $${transaction.recipes[i].recipe.price.toFixed(2)}`;
            recipe.children[2].innerText = `$${price.toFixed(2)}`;
            recipe.onclick = ()=>{
                controller.openStrand("recipeBook");
                controller.openSidebar("recipeDetails", transaction.recipes[i].recipe);
            }
            recipeList.appendChild(recipe);

            totalRecipes += transaction.recipes[i].quantity;
            totalPrice += price;
        }

        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dateString = `${days[transaction.date.getDay()]}, ${months[transaction.date.getMonth()]} ${transaction.date.getDate()}, ${transaction.date.getFullYear()}`;

        document.getElementById("transactionDate").innerText = dateString;
        document.getElementById("transactionTime").innerText = transaction.date.toLocaleTimeString();
        document.getElementById("totalRecipes").innerText = `${totalRecipes} recipes`;
        document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(2)}`;

        if(merchant.pos === "none"){
            document.getElementById("removeTransBtn").onclick = ()=>{this.remove()};
        }
    },

    remove: function(){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch(`/transaction/${this.transaction.id}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    merchant.removeTransaction(this.transaction);

                    controller.openStrand("transactions", merchant.getTransactions());
                    banner.createNotification("TRANSACTION REMOVED");
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    },
}

module.exports = transactionDetails;
},{}],18:[function(require,module,exports){
let transactionFilter = {
    display: function(){
        //Set default dates
        let today = new Date();
        let monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        document.getElementById("transFilterDateStart").valueAsDate = monthAgo;
        document.getElementById("transFilterDateEnd").valueAsDate = today;

        //populate recipes
        let recipeList = document.getElementById("transFilterRecipeList");

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipe = document.createElement("div");
            recipe.innerText = merchant.recipes[i].name;
            recipe.recipe = merchant.recipes[i];
            recipe.classList.add("choosable");
            recipe.onclick = ()=>{this.toggleActive(recipe)};
            recipeList.appendChild(recipe);
        }

        //Submit button
        document.getElementById("transFilterSubmit").onclick = ()=>{this.submit()};
    },

    toggleActive: function(element){
        if(element.classList.contains("active")){
            element.classList.remove("active");
        }else{
            element.classList.add("active");
        }
    },

    submit: function(){
        let data = {
            startDate: document.getElementById("transFilterDateStart").valueAsDate,
            endDate: document.getElementById("transFilterDateEnd").valueAsDate,
            recipes: []
        }

        if(data.startDate >= data.endDate){
            banner.createError("START DATE CANNOT BE AFTER END DATE");
            return;
        }

        let recipes = document.getElementById("transFilterRecipeList").children;
        for(let i = 0; i < recipes.length; i++){
            if(recipes[i].classList.contains("active")){
                data.recipes.push(recipes[i].recipe.id);
            }
        }

        if(data.recipes.length === 0){
            for(let i = 0; i < merchant.recipes.length; i++){
                data.recipes.push(merchant.recipes[i].id);
            }
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response)=>{
                let transactions = [];
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else if(response.length === 0){
                    banner.createError("NO TRANSACTIONS MATCH YOUR SEARCH");
                }else{
                    for(let i = 0; i < response.length; i++){
                        transactions.push(new Transaction(
                            response[i]._id,
                            response[i].date,
                            response[i].recipes,
                            merchant
                        ));
                    }
                }

                controller.openStrand("transactions", transactions);
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = transactionFilter;
},{}],19:[function(require,module,exports){
let analytics = {
    newData: false,
    dateChange: false,
    transactions: [],
    ingredient: {},
    recipe: {},

    display: function(Transaction){
        document.getElementById("analDateBtn").onclick = ()=>{this.changeDates(Transaction)};

        if(this.transactions.length === 0 || this.newData === true){
            let startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            this.transactions = merchant.getTransactions(startDate);
        }

        let slider = document.getElementById("analSlider");
        slider.onchange = ()=>{this.display(Transaction)};

        let ingredientContent = document.getElementById("analIngredientContent");
        let recipeContent = document.getElementById("analRecipeContent");

        if(slider.checked){
            ingredientContent.style.display = "none";
            recipeContent.style.display = "flex";
            this.displayRecipes();
        }else{
            ingredientContent.style.display = "flex";
            recipeContent.style.display = "none"
            this.displayIngredients();
        }
    },

    displayIngredients: function(){
        const itemsList = document.getElementById("itemsList");

        while(itemsList.children.length > 0){
            itemsList.removeChild(itemsList.firstChild);
        }

        for(let i = 0; i < merchant.ingredients.length; i++){
            let li = document.createElement("li");
            li.classList.add("choosable");
            li.item = merchant.ingredients[i];
            li.innerText = merchant.ingredients[i].ingredient.name;
            li.onclick = ()=>{
                const itemsList = document.getElementById("itemsList");
                for(let i = 0; i < itemsList.children.length; i++){
                    itemsList.children[i].classList.remove("active");
                }

                li.classList.add("active");

                this.ingredient = merchant.ingredients[i];
                this.ingredientDisplay();
            };
            itemsList.appendChild(li);
        }

        if(this.dateChange && Object.keys(this.ingredient).length !== 0){
            this.ingredientDisplay();
        }
        this.dateChange = false;
    },

    displayRecipes: function(){
        let recipeList = document.getElementById("analRecipeList");
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let li = document.createElement("li");
            li.classList.add("choosable");
            li.recipe = merchant.recipes[i];
            li.innerText = merchant.recipes[i].name;
            li.onclick = ()=>{
                let recipeList = document.getElementById("analRecipeList");
                for(let i = 0; i < recipeList.children.length; i++){
                    recipeList.children[i].classList.remove("active");
                }
                li.classList.add("active");

                this.recipe = merchant.recipes[i];
                this.recipeDisplay();
            }

            recipeList.appendChild(li);
        }

        if(this.dateChange  && Object.keys(this.recipe).length !== 0){
            this.recipeDisplay();
        }
        this.dateChange = false;
    },

    ingredientDisplay: function(){
        //Get list of recipes that contain the ingredient
        let containingRecipes = [];

        for(let i = 0; i < merchant.recipes.length; i++){
            for(let j = 0; j < merchant.recipes[i].ingredients.length; j++){
                if(merchant.recipes[i].ingredients[j].ingredient === this.ingredient.ingredient){
                    containingRecipes.push({
                        recipe: merchant.recipes[i],
                        quantity: merchant.recipes[i].ingredients[j].quantity
                    });

                    break;
                }
            }
        }

        //Create Graph
        let quantities = [];
        let dates = [];
        let currentDate = (this.transactions.length > 0) ? this.transactions[0].date : undefined;
        let currentQuantity = 0;

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(currentQuantity);
                dates.push(currentDate);
                currentQuantity = 0;
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                for(let k = 0; k < containingRecipes.length; k++){
                    if(this.transactions[i].recipes[j].recipe === containingRecipes[k].recipe){
                        for(let l = 0; l < this.transactions[i].recipes[j].recipe.ingredients.length; l++){
                            const transIngredient = this.transactions[i].recipes[j].recipe.ingredients[l];

                            if(transIngredient.ingredient === this.ingredient.ingredient){

                                currentQuantity += transIngredient.quantity * this.transactions[i].recipes[j].quantity;

                                break;
                            }
                        }
                    }
                }
            }

            if(i === this.transactions.length - 1){
                quantities.push(currentQuantity);
                dates.push(currentDate);
            }
        }

        let trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: this.ingredient.ingredient.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: `QUANTITY (${this.ingredient.ingredient.unit.toUpperCase()})`,
            }
        }

        Plotly.newPlot("itemUseGraph", [trace], layout);

        //Create use cards
        let sum = 0;
        let max = 0;
        let min = (quantities.length > 0) ? quantities[0] : 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
            if(quantities[i] > max){
                max = quantities[i];
            }else if(quantities[i] < min){
                min = quantities[i];
            }
        }
        document.getElementById("analMinUse").innerText = `${min.toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analAvgUse").innerText = `${(sum / quantities.length).toFixed(2)} ${this.ingredient.ingredient.unit}`;        
        document.getElementById("analMaxUse").innerText = `${max.toFixed(2)} ${this.ingredient.ingredient.unit}`;

        let dayUse = [0, 0, 0, 0, 0, 0, 0];
        let dayCount = [0, 0, 0, 0, 0, 0, 0];
        for(let i = 0; i < quantities.length; i++){
            dayUse[dates[i].getDay()] += quantities[i];
            dayCount[dates[i].getDay()]++;
        }

        document.getElementById("analDayOne").innerText = `${(dayUse[0] / dayCount[0]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayTwo").innerText = `${(dayUse[1] / dayCount[1]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayThree").innerText = `${(dayUse[2] / dayCount[2]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFour").innerText = `${(dayUse[3] / dayCount[3]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDayFive").innerText = `${(dayUse[4] / dayCount[4]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySix").innerText = `${(dayUse[5] / dayCount[5]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
        document.getElementById("analDaySeven").innerText = `${(dayUse[6] / dayCount[6]).toFixed(2)} ${this.ingredient.ingredient.unit}`;
    },

    recipeDisplay: function(){
        let quantities = [];
        let dates = [];
        let currentDate;
        let quantity = 0;
        if(this.transactions.length > 0){
            currentDate = this.transactions[0].date;
        }

        for(let i = 0; i < this.transactions.length; i++){
            if(currentDate.getDate() !== this.transactions[i].date.getDate()){
                quantities.push(quantity);
                quantity = 0;
                dates.push(currentDate);
                currentDate = this.transactions[i].date;
            }

            for(let j = 0; j < this.transactions[i].recipes.length; j++){
                const recipe = this.transactions[i].recipes[j];

                if(recipe.recipe === this.recipe){
                    quantity += recipe.quantity;
                }
            }

            if(i === this.transactions.length - 1){
                quantities.push(quantity);
                dates.push(currentDate);
            }
        }

        const trace = {
            x: dates,
            y: quantities,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107"
            }
        }

        const layout = {
            title: this.recipe.name.toUpperCase(),
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "Quantity"
            }
        }

        Plotly.newPlot("recipeSalesGraph", [trace], layout);

        let sum = 0;
        for(let i = 0; i < quantities.length; i++){
            sum += quantities[i];
        }

        document.getElementById("recipeAvgUse").innerText = (sum / quantities.length).toFixed(2);
        document.getElementById("recipeAvgRevenue").innerText = `$${(((sum / quantities.length) * this.recipe.price) / 100).toFixed(2)}`;
    },

    changeDates: function(Transaction){
        let dates = {
            from: document.getElementById("analStartDate").valueAsDate,
            to: document.getElementById("analEndDate").valueAsDate
        }

        if(dates.from > dates.to || dates.from === "" || dates.to === "" || dates.to > new Date()){
            banner.createError("INVALID DATE");
            return;
        }

        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        fetch("/transaction/retrieve", {
            method: "post",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(dates)
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response.data);
                }else{
                    this.transactions = [];

                    for(let i = 0; i < response.length; i++){
                        this.transactions.push(new Transaction(
                            response[i]._id,
                            new Date(response[i].date),
                            response[i].recipes,
                            merchant
                        ));
                    }

                    let isRecipe = document.getElementById("analSlider").checked;
                    if(isRecipe && Object.keys(this.recipe).length !== 0){
                        this.recipeDisplay();
                    }else if(!isRecipe && Object.keys(this.ingredient).length !== 0){
                        this.ingredientDisplay();
                    }
                    
                    this.dateChange = true;
                }
            })
            .catch((err)=>{
                banner.createError("ERROR: UNABLE TO DISPLAY THE DATA");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = analytics;
},{}],20:[function(require,module,exports){
let home = {
    isPopulated: false,

    display: function(){
        if(!this.isPopulated){
            this.drawRevenueCard();
            this.drawRevenueGraph();
            this.drawInventoryCheckCard();
            this.drawPopularCard();

            this.isPopulated = true;
        }
    },

    drawRevenueCard: function(){
        let today = new Date();
        let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        let lastMonthToDay = new Date(new Date().setMonth(today.getMonth() - 1));

        const revenueThisMonth = merchant.getRevenue(firstOfMonth);
        const revenueLastMonthToDay = merchant.getRevenue(firstOfLastMonth, lastMonthToDay);

        document.getElementById("revenue").innerText = `$${revenueThisMonth.toFixed(2)}`;

        let revenueChange = ((revenueThisMonth - revenueLastMonthToDay) / revenueLastMonthToDay) * 100;
        
        let img = "";
        if(revenueChange >= 0){
            img = "/shared/images/upArrow.png";
        }else{
            img = "/shared/images/downArrow.png";
        }
        document.querySelector("#revenueChange p").innerText = `${Math.abs(revenueChange).toFixed(2)}% vs last month`;
        document.querySelector("#revenueChange img").src = img;
    },

    drawRevenueGraph: function(){
        let monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let revenue = [];
        let dates = [];
        let dayRevenue = 0;
        const transactions = merchant.getTransactions(monthAgo);
        let currentDate = (transactions.length > 0) ? transactions[0].date : undefined;
        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].date.getDate() !== currentDate.getDate()){
                revenue.push(dayRevenue / 100);
                dayRevenue = 0;
                dates.push(currentDate);
                currentDate = transactions[i].date;
            }

            for(let j = 0; j < transactions[i].recipes.length; j++){
                const recipe = transactions[i].recipes[j];

                dayRevenue += recipe.recipe.price * recipe.quantity;
            }
        }

        const trace = {
            x: dates,
            y: revenue,
            mode: "lines+markers",
            line: {
                color: "rgb(255, 99, 107)"
            }
        }

        const layout = {
            title: "REVENUE",
            xaxis: {
                title: "DATE"
            },
            yaxis: {
                title: "$"
            }
        }

        Plotly.newPlot("graphCard", [trace], layout);
    },

    drawInventoryCheckCard: function(){
        let num;
        if(merchant.ingredients.length < 5){
            num = merchant.ingredients.length;
        }else{
            num = 5;
        }
        let rands = [];
        for(let i = 0; i < num; i++){
            let rand = Math.floor(Math.random() * merchant.ingredients.length);

            if(rands.includes(rand)){
                i--;
            }else{
                rands[i] = rand;
            }
        }

        let ul = document.querySelector("#inventoryCheckCard ul");
        let template = document.getElementById("ingredientCheck").content.children[0];
        while(ul.children.length > 0){
            ul.removeChild(ul.firstChild);
        }
        for(let i = 0; i < rands.length; i++){
            let ingredientCheck = template.cloneNode(true);
            let input = ingredientCheck.children[1].children[1];
            const ingredient = merchant.ingredients[rands[i]];

            ingredientCheck.ingredient = ingredient;
            ingredientCheck.children[0].innerText = ingredient.ingredient.name;
            ingredientCheck.children[1].children[0].onclick = ()=>{
                input.value--;
                input.changed = true;
            };
            if(ingredient.ingredient.specialUnit === "bottle"){
                input.value = ingredient.quantity.toFixed(2);
                ingredientCheck.children[2].innerText = "BOTTLES";
            }else{
                input.value = ingredient.quantity.toFixed(2);
                ingredientCheck.children[2].innerText = ingredient.ingredient.unit.toUpperCase();
            }

            
            ingredientCheck.children[1].children[2].onclick = ()=>{
                input.value++;
                input.changed = true;
            }
            input.onchange = ()=>{input.changed = true};
            

            ul.appendChild(ingredientCheck);
        }

        document.getElementById("inventoryCheck").onclick = ()=>{this.submitInventoryCheck()};
    },

    drawPopularCard: function(){
        let thisMonth = new Date();
        thisMonth.setDate(1);

        const ingredientList = merchant.getIngredientsSold(thisMonth);
        if(ingredientList !== false){
            ingredientList.sort((a, b)=>{
                if(a.quantity < b.quantity){
                    return 1;
                }
                if(a.quantity > b.quantity){
                    return -1;
                }

                return 0;
            });

            let quantities = [];
            let labels = [];
            let colors = [];
            let count = (ingredientList.length < 5) ? ingredientList.length - 1 : 4;
            for(let i = count; i >= 0; i--){
                const ingredientName = ingredientList[i].ingredient.name;
                const ingredientQuantity = ingredientList[i].quantity;
                const unitName = ingredientList[i].ingredient.unit;

                quantities.push(ingredientList[i].quantity);
                labels.push(`${ingredientName}: ${ingredientQuantity.toFixed(2)} ${unitName.toUpperCase()}`);
                if(i === 0){
                    colors.push("rgb(255, 99, 107");
                }else{
                    colors.push("rgb(179, 191, 209");
                }
            }

            let trace = {
                x: quantities,
                type: "bar",
                orientation: "h",
                text: labels,
                textposition: "auto",
                hoverinfo: "none",
                marker: {
                    color: colors
                }
            }

            let layout = {
                title: "MOST POPULAR INGREDIENTS",
                xaxis: {
                    zeroline: false,
                    title: "QUANTITY"
                },
                yaxis: {
                    showticklabels: false
                }
            }
            
            Plotly.newPlot("popularIngredientsCard", [trace], layout);
        }else{
            document.getElementById("popularCanvas").style.display = "none";

            let notice = document.createElement("p");
            notice.innerText = "N/A";
            notice.classList = "notice";
            document.getElementById("popularIngredientsCard").appendChild(notice);
        }
    },

    //Need to change the updating of ingredients
    //should update the ingredient directly, then send that.  Maybe...
    submitInventoryCheck: function(){
        let lis = document.querySelectorAll("#inventoryCheckCard li");

        let changes = [];
        let fetchData = [];

        for(let i = 0; i < lis.length; i++){
            if(lis[i].children[1].children[1].value >= 0){
                let merchIngredient = lis[i].ingredient;

                if(lis[i].children[1].children[1].changed === true){
                    let value = 0;
                    if(merchIngredient.ingredient.specialUnit === "bottle"){
                        value = parseFloat(lis[i].children[1].children[1].value) * merchIngredient.ingredient.unitSize;
                    }else{
                        value = controller.convertToMain(merchIngredient.ingredient.unit, parseFloat(lis[i].children[1].children[1].value));
                    }
                    

                    changes.push({
                        ingredient: merchIngredient.ingredient,
                        quantity: value
                    });

                    fetchData.push({
                        id: merchIngredient.ingredient.id,
                        quantity: value
                    });

                    lis[i].children[1].children[1].changed = false;
                }
            }else{
                banner.createError("CANNOT HAVE NEGATIVE INGREDIENTS");
                return;
            }
        }
        
        if(fetchData.length > 0){
            let loader = document.getElementById("loaderContainer");
            loader.style.display = "flex";

            fetch("/merchant/ingredients/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(fetchData)
            })
                .then(response => response.json())
                .then((response)=>{
                    if(typeof(response) === "string"){
                        banner.createError(response);
                    }else{
                        for(let i = 0; i < changes.length; i++){
                            merchant.updateIngredient(changes[i].ingredient, changes[i].quantity);
                        }
                        banner.createNotification("INGREDIENTS UPDATED");
                    }
                })
                .catch((err)=>{})
                .finally(()=>{
                    loader.style.display = "none";
                });
        }
    }
}

module.exports = home;
},{}],21:[function(require,module,exports){
let ingredients = {
    isPopulated: false,
    ingredients: [],

    display: function(){
        if(!this.isPopulated){
            document.getElementById("ingredientSearch").oninput = ()=>{this.search()};

            this.populateByProperty();

            this.isPopulated = true;
        }
    },

    populateByProperty: function(){
        let categories;
        categories = merchant.categorizeIngredients();
        
        let ingredientStrand = document.getElementById("categoryList");
        let categoryTemplate = document.getElementById("categoryDiv").content.children[0];
        let ingredientTemplate = document.getElementById("ingredient").content.children[0];
        this.ingredients = [];

        while(ingredientStrand.children.length > 0){
            ingredientStrand.removeChild(ingredientStrand.firstChild);
        }

        for(let i = 0; i < categories.length; i++){
            let categoryDiv = categoryTemplate.cloneNode(true);
            categoryDiv.children[0].children[0].innerText = categories[i].name.toUpperCase();
            
            categoryDiv.children[0].onclick = ()=>{
                this.toggleCategory(categoryDiv.children[1], categoryDiv.children[0].children[1]);
            };
            categoryDiv.children[1].style.display = "none";
            ingredientStrand.appendChild(categoryDiv);

            for(let j = 0; j < categories[i].ingredients.length; j++){
                let ingredient = categories[i].ingredients[j];
                let ingredientDiv = ingredientTemplate.cloneNode(true);

                ingredientDiv.children[0].innerText = ingredient.ingredient.name;
                ingredientDiv.onclick = ()=>{
                    controller.openSidebar("ingredientDetails", ingredient);
                    ingredientDiv.classList.add("active");
                };
                ingredientDiv._name = ingredient.ingredient.name.toLowerCase();
                ingredientDiv._unit = ingredient.ingredient.unit.toLowerCase();
                
                if(ingredient.ingredient.specialUnit === "bottle"){
                    ingredientDiv.children[2].innerText = `${ingredient.quantity.toFixed(2)} BOTTLES`
                }else{
                    ingredientDiv.children[2].innerText = `${ingredient.quantity.toFixed(2)} ${ingredient.ingredient.unit.toUpperCase()}`;
                }

                categoryDiv.children[1].appendChild(ingredientDiv);
                this.ingredients.push(ingredientDiv);
            }
        }

    },

    displayIngredientsOnly: function(ingredients){
        let ingredientDiv = document.getElementById("categoryList");

        while(ingredientDiv.children.length > 0){
            ingredientDiv.removeChild(ingredientDiv.firstChild);
        }
        for(let i = 0; i < ingredients.length; i++){
            ingredientDiv.appendChild(ingredients[i]);
        }
    },

    toggleCategory: function(div, button){
        if(div.style.display === "none"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
            div.style.display = "flex";
        }else if(div.style.display === "flex"){
            button.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
            div.style.display = "none";
        }
    },

    search: function(){
        let input = document.getElementById("ingredientSearch").value.toLowerCase();

        if(input === ""){
            this.populateByProperty();
            return;
        }

        let matchingIngredients = [];
        for(let i = 0; i < this.ingredients.length; i++){
            if(this.ingredients[i]._name.includes(input)){
                matchingIngredients.push(this.ingredients[i]);
            }
        }

        this.displayIngredientsOnly(matchingIngredients);
    }
}

module.exports = ingredients;
},{}],22:[function(require,module,exports){
let orders = {
    orders: [],

    display: function(){
        document.getElementById("orderFilterBtn").onclick = ()=>{controller.openSidebar("orderFilter")};
        document.getElementById("newOrderBtn").onclick = ()=>{controller.openSidebar("newOrder")};

        let orderList = document.getElementById("orderList");
        let template = document.getElementById("order").content.children[0];

        while(orderList.children.length > 0){
            orderList.removeChild(orderList.firstChild);
        }

        for(let i = 0; i < this.orders.length; i++){
            let orderDiv = template.cloneNode(true);
            orderDiv.order = this.orders[i];
            orderDiv.children[0].innerText = this.orders[i].name;
            orderDiv.children[1].innerText = `${this.orders[i].ingredients.length} ingredients`;
            orderDiv.children[2].innerText = this.orders[i].date.toLocaleDateString("en-US");
            orderDiv.children[3].innerText = `$${this.orders[i].getTotalCost().toFixed(2)}`;
            orderDiv.onclick = ()=>{
                controller.openSidebar("orderDetails", this.orders[i]);
                orderDiv.classList.add("active");
            }
            orderList.appendChild(orderDiv);
        }
    },

    getOrders: function(Order){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";

        return fetch("/order", {
            method: "get",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        })
        .then(response => response.json())
        .then((response)=>{
            if(typeof(response) === "string"){
                banner.createError(response);
            }else{
                let orders = [];

                for(let i = 0; i < response.length; i++){
                    orders.push(new Order(
                        response[i]._id,
                        response[i].name,
                        response[i].date,
                        response[i].taxes,
                        response[i].fees,
                        response[i].ingredients,
                        merchant
                    ));
                }

                if(merchant.orders.length === 0){
                    merchant.setOrders(orders);
                }

                return orders;
            }
        })
        .catch((err)=>{
            banner.createError("SOMETHING WENT WRONG. PLEASE REFRESH THE PAGE");
        })
        .finally(()=>{
            loader.style.display = "none";
        });
    }
}

module.exports = orders;
},{}],23:[function(require,module,exports){
let recipeBook = {
    isPopulated: false,
    recipeDivList: [],

    display: function(Recipe){
        if(!this.isPopulated){
            this.populateRecipes();

            if(merchant.pos !== "none"){
                document.getElementById("posUpdateRecipe").onclick = ()=>{this.posUpdate(Recipe)};
            }
            document.getElementById("recipeSearch").oninput = ()=>{this.search()};

            this.populateRecipes();

            this.isPopulated = true;
        }
    },

    populateRecipes: function(){
        let recipeList = document.getElementById("recipeList");
        let template = document.getElementById("recipe").content.children[0];

        this.recipeDivList = [];
        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }

        for(let i = 0; i < merchant.recipes.length; i++){
            let recipeDiv = template.cloneNode(true);
            recipeDiv.onclick = ()=>{
                controller.openSidebar("recipeDetails", merchant.recipes[i]);
                recipeDiv.classList.add("active");
            }
            recipeDiv._name = merchant.recipes[i].name;
            recipeList.appendChild(recipeDiv);

            recipeDiv.children[0].innerText = merchant.recipes[i].name;
            recipeDiv.children[1].innerText = `$${merchant.recipes[i].price.toFixed(2)}`;

            this.recipeDivList.push(recipeDiv);
        }
    },

    search: function(){
        let input = document.getElementById("recipeSearch").value.toLowerCase();
        let recipeList = document.getElementById("recipeList");

        let matchingRecipes = [];
        for(let i = 0; i < this.recipeDivList.length; i++){
            if(this.recipeDivList[i]._name.toLowerCase().includes(input)){
                matchingRecipes.push(this.recipeDivList[i]);
            }
        }

        while(recipeList.children.length > 0){
            recipeList.removeChild(recipeList.firstChild);
        }
        for(let i = 0; i < matchingRecipes.length; i++){
            recipeList.appendChild(matchingRecipes[i]);
        }
    },

    posUpdate: function(Recipe){
        let loader = document.getElementById("loaderContainer");
        loader.style.display = "flex";
        let url = `/recipe/update/${merchant.pos}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
        })
            .then(response => response.json())
            .then((response)=>{
                if(typeof(response) === "string"){
                    banner.createError(response);
                }else{
                    for(let i = 0; i < response.new.length; i++){
                        const recipe = new Recipe(
                            response.new[i]._id,
                            response.new[i].name,
                            response.new[i].price,
                            merchant,
                            []
                        );

                        merchant.addRecipe(recipe);
                    }

                    for(let i = 0; i < response.removed.length; i++){
                        for(let j = 0; j < merchant.recipes.length; j++){
                            if(merchant.recipes[j].id === response.removed[i]._id){
                                merchant.removeRecipe(merchant.recipes[j]);
                                break;
                            }
                        }
                    }

                    this.display();
                }
            })
            .catch((err)=>{
                banner.createError("SOMETHING WENT WRONG.  PLEASE REFRESH THE PAGE");
            })
            .finally(()=>{
                loader.style.display = "none";
            });
    }
}

module.exports = recipeBook;
},{}],24:[function(require,module,exports){
let transactions = {
    transactions: [],

    display: function(Transaction){
        document.getElementById("filterTransactionsButton").onclick = ()=>{controller.openSidebar("transactionFilter")};
        document.getElementById("newTransactionButton").onclick = ()=>{controller.openSidebar("newTransaction")};

        this.populateTransactions(this.transactions);

        this.isPopulated = true;
    },

    populateTransactions: function(transactions){
        let transactionsList = document.getElementById("transactionsList");
        let template = document.getElementById("transaction").content.children[0];

        while(transactionsList.children.length > 0){
            transactionsList.removeChild(transactionsList.firstChild);
        }

        let i = 0;
        while(i < transactions.length && i < 100){
            let transactionDiv = template.cloneNode(true);
            let transaction = transactions[i];

            transactionDiv.onclick = ()=>{
                controller.openSidebar("transactionDetails", transaction);
                transactionDiv.classList.add("active");
            }
            transactionsList.appendChild(transactionDiv);

            let totalRecipes = 0;
            let totalPrice = 0;

            for(let j = 0; j < transactions[i].recipes.length; j++){
                totalRecipes += transactions[i].recipes[j].quantity;
                totalPrice += transactions[i].recipes[j].recipe.price * transactions[i].recipes[j].quantity;
            }

            transactionDiv.children[0].innerText = `${transactions[i].date.toLocaleDateString()} ${transactions[i].date.toLocaleTimeString()}`;
            transactionDiv.children[1].innerText = `${totalRecipes} recipes sold`;
            transactionDiv.children[2].innerText = `$${totalPrice.toFixed(2)}`;

            i++;
        }
    }
}

module.exports = transactions;
},{}]},{},[6]);
>>>>>>> development
