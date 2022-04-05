/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"

//import Bills
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

//import ROUTES
import { ROUTES } from "../constants/routes.js";
import { ROUTES_PATH} from "../constants/routes.js";

//keep class / librairies Jest
import {toHaveClass} from "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"

//import MOCK

import {localStorageMock} from "../__mocks__/localStorage.js";


import router from "../app/Router.js";

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
