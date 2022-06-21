# Click-to-Call Web Integrations

This repo presents samples and easily deployable components to integrate [Amazon Chime Click-to-Call](https://github.com/aws-samples/amazon-chime-sdk-click-to-call) in a general website with the absolute minimal dependencies and a very simple mechanism to include the functionality.

## Assumptions

* The website where Click-to-Call is to be integrated will exercise user management and present the functionality to logged in users so as 
  * secure access the API and backend resources

In this project a small sample website using [Amazon Cognito](https://aws.amazon.com/cognito/) user management, authentication, and authorization is provided for reference.

## Tenets

* Simple integration with minimal footprint (e.g. `<script>` and `<div>` tags)
  * single url to include
  * single div tag to place

* Provide Higher Order integration patterns (e.g. React Component)

* Allow for configuration of features and styling with tag attributes
  * compatible with Bootstrap
  * integrates with CSS

* Minimal trust of client
  * user must log in
  * logged in user receives an access token which must be passed to the Click-to-Call object to allow the widget to access the backend API to setup the call

## Structure of project


```mermaid
    C4Context
      title System Context diagram for Internet Banking System

      Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
      Person(customerB, "Banking Customer B")
      Person_Ext(customerC, "Banking Customer C")
      System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

      Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")

      Enterprise_Boundary(b1, "BankBoundary") {

        SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

        System_Boundary(b2, "BankBoundary2") {
          System(SystemA, "Banking System A")
          System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts.")
        }

        System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
        SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")

        Boundary(b3, "BankBoundary3", "boundary") {
          SystemQueue(SystemF, "Banking System F Queue", "A system of the bank, with personal bank accounts.")
          SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
        }
      }

      BiRel(customerA, SystemAA, "Uses")
      BiRel(SystemAA, SystemE, "Uses")
      Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
      Rel(SystemC, customerA, "Sends e-mails to")
      
```


## Backlog of work items -- TODOs

[ ] Storyboard/Wireframe use cases

[ ] Architecture Diagram

[ ] API design (actions/objects) and sequence diagram
