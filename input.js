document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.target');
  let draggingElement = null;
  let offsetX = 0;
  let offsetY = 0;
  let stickToMouse = false;
  let stickToTouch = false;  // Флаг для сенсорного режима "следующий за пальцем"
  let initialPosition = {};
  let isTouchMove = false;   // Флаг для определения, двигался ли палец

  // Обработчик для начала перемещения мышью
  targets.forEach(target => {
    target.addEventListener('mousedown', (event) => {
      if (!stickToMouse) {
        startDrag(event.clientX, event.clientY, event.target);
      }
    });

    // Обработчик двойного клика мыши (включает режим "следующий за мышью")
    target.addEventListener('dblclick', (event) => {
      stickToMouse = true;
      startStickTo(event.clientX, event.clientY, event.target);
    });

    // Для сенсорного экрана - аналог mousedown
    target.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      if (!stickToTouch) {
        startDrag(touch.clientX, touch.clientY, event.target);
      }
    });

    // Для сенсорного экрана - двойное касание для режима "следующий за пальцем"
    target.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1 && event.detail === 2) {  // Двойное касание
        const touch = event.touches[0];
        stickToTouch = true;
        startStickTo(touch.clientX, touch.clientY, event.target);
      }
    });
  });

  // Начало перемещения
  function startDrag(clientX, clientY, element) {
    draggingElement = element;
    offsetX = clientX - draggingElement.getBoundingClientRect().left;
    offsetY = clientY - draggingElement.getBoundingClientRect().top;
    initialPosition[draggingElement] = { top: draggingElement.style.top, left: draggingElement.style.left };
  }

  // Начало режима следования
  function startStickTo(clientX, clientY, element) {
    draggingElement = element;
    draggingElement.style.backgroundColor = 'blue';  // Изменяем цвет при активации режима
    offsetX = clientX - draggingElement.getBoundingClientRect().left;
    offsetY = clientY - draggingElement.getBoundingClientRect().top;
  }

  // Перемещение элемента мышью
  document.addEventListener('mousemove', (event) => {
    if (draggingElement && !stickToTouch) {
      moveElement(event.clientX, event.clientY);
    }
  });

  // Перемещение элемента пальцем (сенсорный экран)
  document.addEventListener('touchmove', (event) => {
    if (draggingElement && event.touches.length === 1) {
      isTouchMove = true;
      const touch = event.touches[0];
      moveElement(touch.clientX, touch.clientY);
    }
    // Второе касание прекращает перемещение (аналог клавиши Esc)
    if (event.touches.length > 1) {
      resetPosition();
    }
  });

  // Перемещаем элемент в новую позицию
  function moveElement(clientX, clientY) {
    draggingElement.style.left = `${clientX - offsetX}px`;
    draggingElement.style.top = `${clientY - offsetY}px`;
  }

  // Завершение перемещения мышью
  document.addEventListener('mouseup', () => {
    if (!stickToMouse) {
      draggingElement = null;
    }
  });

  // Завершение перемещения пальцем
  document.addEventListener('touchend', (event) => {
    if (!stickToTouch && !isTouchMove) {
      draggingElement = null;
    }
    isTouchMove = false;  // Сброс флага
  });

  // Завершаем режим "следующий за мышью"
  document.addEventListener('click', () => {
    if (stickToMouse && draggingElement) {
      stickToMouse = false;
      draggingElement.style.backgroundColor = 'red';  // Возвращаем исходный цвет
      draggingElement = null;
    }
  });

  // Завершаем режим "следующий за пальцем"
  document.addEventListener('touchend', (event) => {
    if (stickToTouch && draggingElement) {
      const touch = event.changedTouches[0];
      // Проверка, что touchstart и touchend произошли в одном месте (аналог щелчка)
      if (Math.abs(touch.clientX - offsetX) < 10 && Math.abs(touch.clientY - offsetY) < 10) {
        stickToTouch = false;
        draggingElement.style.backgroundColor = 'red';  // Возвращаем исходный цвет
        draggingElement = null;
      }
    }
  });

  // Сброс позиции и завершение перемещения при нажатии Esc или втором касании
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      resetPosition();
    }
  });

  // Функция для сброса позиции элемента
  function resetPosition() {
    if (draggingElement) {
      draggingElement.style.left = initialPosition[draggingElement].left;
      draggingElement.style.top = initialPosition[draggingElement].top;
      draggingElement.style.backgroundColor = 'red';  // Возвращаем цвет обратно
      draggingElement = null;
      stickToMouse = false;
      stickToTouch = false;
    }
  }
});
