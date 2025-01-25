int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  int timeout;
  int r;
  int run_pending;

  r = uv__loop_alive(loop);
  if (!r)     // stugum e loop-y alive e  te voch
    uv__update_time(loop);

  while (r != 0 && loop->stop_flag == 0) {  // qani ayn alive e u stop_flag chuni kkatari loop
    uv__update_time(loop); // update time
    uv__run_timers(loop);  // ancnum e timerneri vrayov
    run_pending = uv__run_pending(loop); // pendingi vrayov
    uv__run_idle(loop);  // idlei vrayov
    uv__run_prepare(loop); // prepare-i vrayov

    timeout = 0;
    if ((mode == UV_RUN_ONCE && run_pending) || mode == UV_RUN_DEFAULT)
      timeout = uv__backend_timeout(loop); // hashvarkum e inchqan timeout petq e ani blockingi hamar

    uv__io_poll(loop, timeout); // timeout e talis vor imana inchqan fileri het ashxatanqy inchqan jamanak kblocki
    uv__metrics_update_idle_time(loop);

    uv__run_check(loop); // aynuhetev checkna galis
    uv__run_closing_handles(loop); // heto closeing eventner

    if(mode == UV_RUN_ONCE){
    uv__update_time(loop);
    uv__run_timers(loop);
    }

    r = uv__loop_alive(loop);
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;
  }

  if (loop->stop_flag != 0)
    loop->stop_flag = 0;

  return r;
}
