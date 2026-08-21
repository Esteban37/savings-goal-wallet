package com.rnsavingsnotifier

import android.app.AlertDialog
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import java.util.concurrent.atomic.AtomicBoolean

class RnSavingsNotifierModule(reactContext: ReactApplicationContext) :
  NativeRnSavingsNotifierSpec(reactContext) {

  override fun notifyGoalCompleted(goalName: String, promise: Promise) {
    if (goalName.isEmpty()) {
      promise.resolve(null)
      return
    }

    val context = reactApplicationContext.applicationContext
    val message = "Meta completada: $goalName"
    UiThreadUtil.runOnUiThread {
      Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }
    promise.resolve(null)
  }

  override fun notifyGoalCreated(goalName: String, promise: Promise) {
    if (goalName.isEmpty()) {
      promise.resolve(null)
      return
    }

    val context = reactApplicationContext.applicationContext
    val message = "Meta registrada: $goalName"
    UiThreadUtil.runOnUiThread {
      Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }
    promise.resolve(null)
  }

  override fun showConfirmDialog(title: String, message: String, promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }

    UiThreadUtil.runOnUiThread {
      val settled = AtomicBoolean(false)
      fun settle(value: Boolean) {
        if (settled.compareAndSet(false, true)) {
          promise.resolve(value)
        }
      }

      AlertDialog.Builder(activity)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton("Eliminar") { _, _ -> settle(true) }
        .setNegativeButton("Cancelar") { _, _ -> settle(false) }
        .setOnCancelListener { settle(false) }
        .show()
    }
  }

  companion object {
    const val NAME: String = NativeRnSavingsNotifierSpec.NAME
  }
}
