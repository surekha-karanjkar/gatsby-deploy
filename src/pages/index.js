import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import axios from "axios"

const ContactForm = () => {
  const WEBSITE_URL = "http://localhost/wpgatsbyContactForm7"
  const FORM_ID = "5" //Form id that provides Contact Form 7

  const [token, setToken] = useState("") // store token
  const [isSuccessMessage, setIsSuccessMessage] = useState(false) // manage is success message state
  const [messageSent, setMessageSent] = useState(false) // manage sent message state
  const [successMessageSent, setsuccessMessageSent] = useState(false) // manage sent message state

  // this effect function authenticates our subcriber user to get a token
  useEffect(() => {
    axios({
      method: "post",
      url: `${WEBSITE_URL}/wp-json/jwt-auth/v1/token`,
      data: {
        username: "admin", // provide a user credential with subscriber role
        password: "admin",
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        setToken(response.data.token)
      })
      .catch(error => console.error("Error", error))
  }, [])

  // use useFormik hook using object destructuring assignment to extract helpful methods
  const { handleChange, isSubmitting, values, handleSubmit } = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      message: "",
    },
    onSubmit: ({ fullname, email, message }, { setSubmitting, resetForm }) => {
      setSubmitting(true)
      // here we created a FormData field for each form field
      const bodyFormData = new FormData()
      bodyFormData.set("fullname", fullname)
      bodyFormData.set("email", email)
      bodyFormData.set("message", message)

      //here we sent
      axios({
        method: "post",
        url: `${WEBSITE_URL}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`,
        data: bodyFormData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
        .then(response => {
          // actions taken when submission goes OK
          resetForm()
          setSubmitting(false)
          setMessageSent(true)
          setsuccessMessageSent(true)
          setIsSuccessMessage(true)
        })
        .catch(error => {
          // actions taken when submission goes wrong
          setSubmitting(false)
          setMessageSent(true)
          setIsSuccessMessage(false)
          setsuccessMessageSent(false)
        })
    },
  })

  useEffect(() => {
    // set timeout 3 seconds to remove error/success message.
    setTimeout(() => {
      // this will reset messageSent and isSuccessMessage state
      setMessageSent(false)
      setIsSuccessMessage(false)
      setsuccessMessageSent(false)
    }, 3000)
    // this effect function will be dispatched when isSuccessMessage or messageSent changes its state
  }, [isSuccessMessage, messageSent])

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <div>
          <table>
            <tr>
              <td>
                <label htmlFor="fullname">Fullname*</label>
              </td>
              <td>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  onChange={handleChange}
                  value={values.fullname}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="email">Email*</label>
              </td>
              <td>
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={values.email}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="message">Message*</label>
              </td>
              <td>
                <textarea
                  id="message"
                  name="message"
                  type="text"
                  onChange={handleChange}
                  value={values.message}
                  required
                />
              </td>
            </tr>
          </table>
        </div>
      </fieldset>
      <div>
        <input type="submit" value="Send Message" disabled={isSubmitting} />
      </div>
      {messageSent && isSuccessMessage && <div>Message sent successfully!</div>}
      {messageSent && !isSuccessMessage && (
        <div>something went wrong please try again.</div>
      )}
    </form>
  )
}

export default ContactForm
