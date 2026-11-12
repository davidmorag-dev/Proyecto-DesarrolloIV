package org.ucr.agenda

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ActivityValidationTest {
    @Test
    fun acceptsValidLeapDay() {
        assertTrue(validateActivity(ActivityDraft("Ensayo", "2028-02-29", "Practicar demo")).isValid)
    }

    @Test
    fun rejectsInvalidFields() {
        val errors = validateActivity(ActivityDraft(" ", "2027-02-29", "x"))
        assertFalse(errors.isValid)
        assertTrue(errors.title != null && errors.date != null && errors.description != null)
    }
}
