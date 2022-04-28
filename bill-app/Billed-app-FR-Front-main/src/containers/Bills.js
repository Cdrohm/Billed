import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)

    //MODIF syntaxe miss {}
    if (buttonNewBill) {
       buttonNewBill.addEventListener('click', this.handleClickNewBill)
    }   
    //
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)

    //incorpor data-testid
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container" data-testid="modalBody"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      //console log to store
      //console.log('STORE', this.store);

      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        //MODIF sort bills by date
        .sort((a,b) => new Date(a.date) > new Date(b.date) ? -1 : new Date(a.date) < new Date(b.date) ? 1 : 0)
        //
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc) //console log => jest integr get bills
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          //.filter(bills => bills.email === userEmail)
          //console.log('length', bills.length)
        return bills
      })
    }
  }
}
