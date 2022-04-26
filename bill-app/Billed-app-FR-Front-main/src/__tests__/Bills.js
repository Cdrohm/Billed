/**
 * @jest-environment jsdom
 */

//@jest-environment => DOM simulation
import {screen, waitFor} from "@testing-library/dom"

//import Bills
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

//import ROUTES
import { ROUTES } from "../constants/routes.js";
import { ROUTES_PATH} from "../constants/routes.js";

// librairies Jest
import {toHaveClass} from "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"

//import MOCK
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store"

//import format
import {formatDate, formatStatus} from "../app/format.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

//declare onNavigate
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES ({pathname})}


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      //console.log ("ici")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //expect use to execute F and stock the return value
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML) //regex date
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//Employe user test
//eye icon click
describe('Unit tests from Bills', () => {
    describe ('eyeIcon button', () => {
      it ('first eyebtn should render first mockedBills img', () =>{
        document.body.innerHTML = BillsUI ({data: bills})
        const eyeIcon = screen.getAllByTestId('icon-eye') [0] //keep Ic eye on array Ic
        //keep url
        const fileUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"

        //expect
        expect(eyeIcon.dataset.billUrl).toEqual(fileUrl) //take url 
      })

      it('all eyeBtns should open modal on click', () =>{
        const billsContainer = new Bills({document, onNavigate, localStorage: window.localStorage})
        const handleClickIconEyeMethod = jest.fn(billsContainer.handleClickIconEye)
        const eyeIcons = screen.getAllByTestId('icon-eye') //Ic eye
        global.window= {}
        $.fn.modal = jest.fn
          for (let eyeIcon of eyeIcons) {
            handleClickIconEyeMethod(eyeIcon)
            userEvent.click(eyeIcon)
          }

        //expect
        expect(handleClickIconEyeMethod).toHaveBeenCalledTimes(eyeIcons.length)  
      })
    })

  //new bill btn + icon win/mail
  describe('Testing newBill button', () => {
    it('buttonNewBill should open newBill on click', () =>{
      const billsContainer = new Bills({document, onNavigate, localStorage: window.localStorage}) //simu new bills
      const handleClickNewBillMethod = jest.fn(billsContainer.handleClickNewBill) //simu click
      const buttonNewBill = screen.getByTestId('btn-new-bill') //test btn new bill

      handleClickNewBillMethod(buttonNewBill)
      userEvent.click(buttonNewBill) //simu user click btn

      //expect
      expect(handleClickNewBillMethod).toHaveBeenCalled()
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy() 
    })
    
    it('should change icon window + icon mail className -> navigate to NewBill', () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const windowIcon = screen.getByTestId('icon-window') //Ic window 
      const mailIcon = screen.getByTestId('icon-mail') //Ic mail

      //expect
      //tohaveclass =/ array window off/mail on
      expect(windowIcon).not.toHaveClass('active-icon') //Ic window off
      expect(mailIcon).toHaveClass('active-icon') //Ic mail on
    })
  })
})

//Store / => console.log error async/promise bills
describe('Get tests integr', () => {


  it('if store, shoudl display bills with good date + format', async () => { //async
    const billsContainer = new Bills ({document, onNavigate, store:mockedStore, localStorage:window.localStorage})
    const spyList = jest.spyOn(billsContainer, 'getBills') //jest search in all bills mocked
    const data = await billsContainer.getBills() //await bills
    const mockedBills = await mockedStore.bills().list() //await mock bug?
    
    const mockedDate = mockedBills[0].date // search date on mock
    const mockedStatus = mockedBills[0].status //search statut on mock

    //expects
    expect (spyList).toHaveBeenCalledTimes(1)
    expect (data[0].date).toEqual(formatDate(mockedDate))
    expect (data[0].status).toEqual(formatStatus(mockedStatus))
  })



  //if corrupted
  it('if corrupted store, should console.log + return {date: "test1", status: undefined}', async () => { //keep console log error + mess undefined user
  const storeCorrupt = { 
    bills(){
      return {
        list() {
          return Promise.resolve ([{ //stack overflow Promise => value/promise/next 
            id:'CeKy5Mo4jkmdfPGYpTxZ',
            vat: '30',
            date:'test1',
            status:'unknow',

          }])
        },
      }
    }  
  }

  const billsContainer = new Bills ({document, onNavigate, store:storeCorrupt, localStorage:window.localStorage}) //change storage target
  const spyConsole = jest.spyOn(console, 'log')
  const data = await billsContainer.getBills() //await

  //expects
  expect(spyConsole).toHaveBeenCalled()
  expect(data[0].date).toEqual('test1')
  expect(data[0].status).toEqual(undefined)

})


  //describe('')


// error 404 and 500
  describe('When API makes error', () => {
    beforeEach(() =>{
      jest.spyOn(mockedStore, "bills")
      Object.defineProperty(
        window, 'localStorageMock', {value: localStorageMock}
      )
      window.localStorage.setItem('user', JSON.stringify ({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML = ''
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    it('fetches bills fr API and message error 404', () =>{
      mockedStore.bills.mockImplementationOnce(() =>{
        return {
          list: () => {
            return Promise.reject(new error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({error: 'Erreur 404'}) //keep 404
      const message = screen.getByText(/Erreur 404/) // /'/ for take
      expect(message).toBeTruthy()
    })

    it('fetches messages fr API and error 500', async () => {
    mockedStore.bills.mockImplementationOnce(() => {
      return {
        list : () => {
          return Promise.reject(new Error("Erreur 500"))
        }
      }
    })
    document.body.innerHTML = BillsUI({error: 'Erreur 500'}) //keep 500
    const message = screen.getByText(/Erreur 500/) // /'/ for take
    expect(message).toBeTruthy()
    })
  })
})

