(function () {
  "use strict";

  /* =========================================================
     FORMULÁRIO PRINCIPAL
     Validação client-side pronta. O envio real (submitForm)
     precisa ser conectado a um endpoint/CRM real — nenhuma
     integração foi encontrada no projeto original.
  ========================================================= */
  var form = document.getElementById("form-principal");

  function setFieldError(field, message) {
    var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      field.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(field) {
    var value = field.value.trim();

    if (field.hasAttribute("required") && !value) {
      setFieldError(field, "Preencha este campo.");
      return false;
    }

    if (field.type === "email" && value) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setFieldError(field, "Digite um e-mail válido.");
        return false;
      }
    }

    if (field.type === "tel" && value) {
      var digits = value.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 11) {
        setFieldError(field, "Digite um WhatsApp válido, com DDD.");
        return false;
      }
    }

    setFieldError(field, "");
    return true;
  }

  if (form) {
    var fields = form.querySelectorAll("input[required]");
    var statusEl = form.querySelector("[data-form-status]");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var isValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        if (statusEl) {
          statusEl.textContent = "Verifique os campos destacados acima.";
          statusEl.setAttribute("data-state", "error");
        }
        return;
      }

      submitForm(form, statusEl);
    });
  }

  function submitForm(formEl, statusEl) {
    var endpoint = formEl.getAttribute("data-form-endpoint");

    if (!endpoint) {
      // PENDÊNCIA: nenhum endpoint configurado. Conecte o formulário
      // definindo data-form-endpoint no <form> em index.html e troque
      // este bloco por um fetch() real para o CRM/webhook do evento.
      console.warn(
        "[form-principal] Endpoint não configurado. Defina data-form-endpoint em index.html para ativar o envio real."
      );
      if (statusEl) {
        statusEl.textContent =
          "Formulário pronto, aguardando conexão com o sistema de inscrições.";
        statusEl.setAttribute("data-state", "success");
      }
      return;
    }

    var payload = new FormData(formEl);

    fetch(endpoint, { method: "POST", body: payload })
      .then(function (response) {
        if (!response.ok) throw new Error("Falha no envio.");
        if (statusEl) {
          statusEl.textContent = "Vaga garantida! Confira seu e-mail e WhatsApp.";
          statusEl.setAttribute("data-state", "success");
        }
        formEl.reset();
      })
      .catch(function () {
        if (statusEl) {
          statusEl.textContent = "Não foi possível enviar agora. Tente novamente.";
          statusEl.setAttribute("data-state", "error");
        }
      });
  }

  /* =========================================================
     COUNTDOWN — desativado por padrão (ver comentário no
     index.html). Só é ativado quando o elemento #countdown
     tiver data-event-date preenchido e o atributo hidden
     removido.
  ========================================================= */
  var countdownEl = document.getElementById("countdown");

  if (countdownEl && !countdownEl.hasAttribute("hidden")) {
    var eventDate = countdownEl.getAttribute("data-event-date");
    var targetTime = eventDate ? new Date(eventDate).getTime() : NaN;

    if (!isNaN(targetTime)) {
      var daysEl = countdownEl.querySelector("[data-days]");
      var hoursEl = countdownEl.querySelector("[data-hours]");
      var minutesEl = countdownEl.querySelector("[data-minutes]");
      var secondsEl = countdownEl.querySelector("[data-seconds]");

      var tick = function () {
        var diff = targetTime - Date.now();
        if (diff <= 0) {
          countdownEl.setAttribute("hidden", "");
          clearInterval(interval);
          return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);

        if (daysEl) daysEl.textContent = String(d).padStart(2, "0");
        if (hoursEl) hoursEl.textContent = String(h).padStart(2, "0");
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, "0");
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, "0");
      };

      tick();
      var interval = setInterval(tick, 1000);
    }
  }

  /* =========================================================
     CTA final -> foco no formulário principal
  ========================================================= */
  var finalCta = document.querySelector("[data-scroll-to-form]");
  if (finalCta) {
    finalCta.addEventListener("click", function () {
      var nomeField = document.getElementById("nome");
      if (nomeField) {
        window.setTimeout(function () {
          nomeField.focus({ preventScroll: true });
        }, 500);
      }
    });
  }
})();
