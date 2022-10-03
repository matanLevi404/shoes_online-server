// heading section
const biil_to = document.querySelector(".bill-to");
const address = document.querySelector(".address");
const invoice_date = document.querySelector(".invoice-date");
const due_date = document.querySelector(".due-date");
const invoice_num = document.querySelector(".invoice-num");
// heading section

// table section
const table_body = document.querySelector(".table-body");
// table section

//stats section
const sub_total = document.querySelector("#subtotal-price");
//stats section

// payment info section
const grand_total_price = document.querySelector("#grand-total-price");
const account_id = document.querySelector(".account-id");
const ac_name = document.querySelector(".ac_name");
const digits = document.querySelector(".digits");
// payment info section

async function getJson() {
  const res = await fetch("./newOrder.json");
  const checkoutInfo = await res.json();
  console.log(checkoutInfo);

  // heading section manipulate
  biil_to.textContent =
    "BILL TO: " +
    checkoutInfo.client[0].name +
    " " +
    checkoutInfo.client[0].lastname;
  address.textContent =
    checkoutInfo.client[0].city + " " + checkoutInfo.client[0].street;
  invoice_date.textContent += " " + checkoutInfo.orderDate.slice(0, 10);
  due_date.textContent += " " + checkoutInfo.dueDate;
  invoice_num.textContent += " #" + checkoutInfo.orderId;
  // heading section manipulate

  // stats section manipulate
  sub_total.textContent = " " + checkoutInfo.subTotal + ".00";
  // stats section manipulate

  // payment info manipulate
  grand_total_price.textContent = checkoutInfo.total + ".00";
  account_id.textContent = checkoutInfo.client[0].id;
  ac_name.textContent = checkoutInfo.client[0].username;
  digits.textContent += checkoutInfo.digits;
  // payment info manipulate

  // table section manipulate
  for (let i = 0; i < checkoutInfo.cart.length; i++) {
    const item = checkoutInfo.cart[i];
    const unit_price = item.price / item.amount;
    const item_row = document.createElement("tr");

    const item_th_description = document.createElement("th");
    const description_div = document.createElement("div");
    item_th_description.className = "description";
    const item_th_unit_price = document.createElement("td");
    const item_th_qyt = document.createElement("td");
    const item_th_amount = document.createElement("td");

    item_th_description.textContent = `${item.name}`;
    description_div.textContent = `${item.brand} ${item.color} size: ${item.size}`;
    item_th_unit_price.textContent = unit_price + ".00";
    item_th_qyt.textContent = "X" + item.amount;
    item_th_amount.textContent = item.price + ".00";

    item_th_description.appendChild(description_div);
    item_row.appendChild(item_th_description);
    item_row.appendChild(item_th_unit_price);
    item_row.appendChild(item_th_qyt);
    item_row.appendChild(item_th_amount);

    table_body.appendChild(item_row);
  }

  // table section manipulate

  // generating the invoice as an image
  const screenShot = document.querySelector("#invoiceBody");
  console.log("i was here");

  html2canvas(screenShot).then((canvas) => {
    const base64Image = canvas.toDataURL("image/png");
    let anchor = document.createElement("a");
    anchor.setAttribute("href", base64Image);
    anchor.setAttribute("download", "my-image.png");
    anchor.click();
    anchor.remove();
  });

  // generating the invoice as an image
}

getJson();
