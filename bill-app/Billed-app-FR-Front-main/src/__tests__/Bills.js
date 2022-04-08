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
      //to-do write expect expression
      //expect use to execute F and stock the return value
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//Employe user test
//eye icon click
describe('Unit tests from Billes', () => {
  describe ('eyeIcon button', () => {
    it ('first eyebtn should render first mockedBills img', () =>{
      document.body.innerHTML = BillsUI ({data: bills})
      const eyeIcon = screen.getAllByTestId('icon-eye') [0]
      //keep url
      const fileUrl = "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"

      //expect
      expect(handleClickIconEyeMethod).toHaveBeenCalledTimes(eyeIcons.lenght)
    })
  })

//new bill btn + icon win/mail
describe('Testing newBill button', () => {
  it('buttonNewBill should open newBill on click', () =>{
    const billsContainer = new Bills({document, onNavigate, localStorage: window.localStorage})
    const handleClickNewBillMethod = jest.fn(billsContainer.handleClickNewBill)
    const buttonNewBill = screen.getAllByTestId('btn-new-bill')

    handleClickNewBillMethod(buttonNewBill)
    userEvent.click(buttonNewBill)

    //expect
    expect(handleClickNewBillMethod).toHaveBeenCalled()
    expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
  })
  
  it('should change icon window + icon mail className -> navigate to NewBill', () => {
    window.onNavigate(ROUTES_PATH.NewBill)
    const iconWindow = screen.getAllByTestId('icon-window')
    const iconMail = screen.getAllByTestId('icon-mail')

    //expect
    expect(iconWindow).not.toHaveClass('active-icon')
    expect(iconMail).toHaveClass('active-icon')
  })
})
